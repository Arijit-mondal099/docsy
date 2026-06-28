import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { chats, messages } from '@/lib/db/schema';
import { searchDocumentChunks, getChatModel } from '@/lib/ai/rag';
import { streamText } from 'ai';
import { checkMessageAllowed, incrementMessagesSent } from '@/lib/db/usage';
import { eq } from 'drizzle-orm';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Check message usage limit
  const { allowed, reason } = await checkMessageAllowed(session.user.id);
  if (!allowed) {
    return new Response(JSON.stringify({ error: reason }), {
      status: 429,
    });
  }

  const { messages: incomingMessages, id: chatId, documentId } = await request.json();
  const lastUserMessage = incomingMessages?.findLast(
    (m: { role: string }) => m.role === 'user',
  )?.content;

  if (!lastUserMessage) {
    return new Response(JSON.stringify({ error: 'No user message found' }), { status: 400 });
  }

  if (!chatId && !documentId) {
    return new Response(JSON.stringify({ error: 'chatId or documentId is required' }), {
      status: 400,
    });
  }

  try {
    // Get or create chat
    let chat: typeof chats.$inferSelect;

    if (chatId) {
      const existing = await db
        .select()
        .from(chats)
        .where(eq(chats.id, chatId))
        .then((rows) => rows[0]);

      if (!existing && documentId) {
        // Create new chat with given ID
        const [newChat] = await db
          .insert(chats)
          .values({
            id: chatId,
            documentId,
            userId: session.user.id,
          })
          .returning();
        chat = newChat;
      } else if (!existing) {
        return new Response(JSON.stringify({ error: 'Chat not found' }), {
          status: 404,
        });
      } else {
        chat = existing;
      }
    } else if (documentId) {
      // No chatId but documentId provided — create new chat
      const [newChat] = await db
        .insert(chats)
        .values({
          documentId,
          userId: session.user.id,
        })
        .returning();
      chat = newChat;
    } else {
      return new Response(JSON.stringify({ error: 'Could not determine chat' }), { status: 400 });
    }

    // Save user message
    await db.insert(messages).values({
      chatId: chat.id,
      role: 'user',
      content: lastUserMessage,
    });

    // Load full history for AI context
    const dbMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chat.id))
      .orderBy(messages.createdAt);

    // Search RAG
    const chunks = await searchDocumentChunks(lastUserMessage, chat.documentId);

    // Build system prompt
    const contextText =
      chunks.length > 0 ? chunks.join('\n\n---\n\n') : 'No relevant context found in the document.';

    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided document context. 
If the answer cannot be found in the context, say so clearly. Do not make up information.

Context from the document:
${contextText}`;

    // Increment usage counter before streaming
    // This ensures the counter is always updated for messages that reach this point
    await incrementMessagesSent(session.user.id);

    // Try primary model, fallback to Gemini on error
    let useFallback = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = streamText({
          model: getChatModel(useFallback),
          system: systemPrompt,
          messages: dbMessages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          onFinish: async ({ text }) => {
            // Save assistant response after stream completes
            if (text) {
              await db.insert(messages).values({
                chatId: chat.id,
                role: 'assistant',
                content: text,
              });
            }
          },
        });

        return result.toTextStreamResponse({
          headers: {
            'X-Chat-Id': chat.id,
          },
        });
      } catch (e) {
        console.error(`Chat attempt ${attempt + 1} failed:`, e);
        useFallback = true;
      }
    }

    // Both attempts failed
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), { status: 500 });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
