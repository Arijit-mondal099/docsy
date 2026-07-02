import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { chats, messages } from '@/lib/db/schema';
import { searchDocumentChunks } from '@/lib/ai/rag';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { tryIncrementMessagesSent } from '@/lib/db/usage';
import { eq, and } from 'drizzle-orm';

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

  const {
    messages: incomingMessages,
    id: chatId,
    documentId,
    model: preferredModel,
  } = await request.json();
  const lastUserMessage = incomingMessages
    ?.slice()
    .reverse()
    .find((m: { role: string }) => m.role === 'user')?.content;

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
        .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
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

    // Auto-name chat from first user message if no name set
    if (!chat.name) {
      const chatName =
        lastUserMessage.length > 50 ? lastUserMessage.slice(0, 47) + '...' : lastUserMessage;
      await db.update(chats).set({ name: chatName }).where(eq(chats.id, chat.id));
    }

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
      chunks.length > 0
        ? chunks.map((c) => c.text).join('\n\n---\n\n')
        : 'No relevant context was found in this document. You must refuse to answer using your own knowledge.';

    const systemPrompt = `You are a strict document Q&A assistant. You MUST follow these rules:

1. ONLY answer questions using the document context provided below.
2. If the answer is not in the context below, respond with EXACTLY:
   "I cannot find information about this in the document."
3. Do NOT use any prior knowledge, training data, or external information to answer.
4. Do NOT make up or infer information not present in the context.
5. Do NOT reference any other documents, conversations, or users.

Context from the document:
${contextText}`;

    // Atomic check-and-increment usage counter before streaming
    const { allowed, reason } = await tryIncrementMessagesSent(session.user.id);
    if (!allowed) {
      return new Response(JSON.stringify({ error: reason }), {
        status: 429,
      });
    }

    // Select model based on user preference, with fallback
    const modelChain = [
      preferredModel === 'gemini-2.0-flash' ? google('gemini-2.0-flash') : openai('gpt-4o'),
      preferredModel === 'gemini-2.0-flash' ? openai('gpt-4o') : google('gemini-2.0-flash'),
    ];

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = streamText({
          model: modelChain[attempt],
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
      }
    }

    // Both attempts failed
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), { status: 500 });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
