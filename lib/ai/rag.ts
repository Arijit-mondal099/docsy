import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { getPineconeIndex, getDocumentNamespace } from './pinecone';
import { getEmbedding } from './embedding';

export async function searchDocumentChunks(
  query: string,
  documentId: string,
  topK = 5,
): Promise<string[]> {
  // Embed the query
  const queryEmbedding = await getEmbedding(query);

  // Search Pinecone
  const index = getPineconeIndex();
  const namespace = getDocumentNamespace(documentId);

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    namespace,
    includeMetadata: true,
  });

  // Extract text from results
  return (
    results.matches
      ?.map((match) => match.metadata?.text as string)
      .filter(Boolean) ?? []
  );
}

export function getChatModel(useFallback = false) {
  return useFallback ? google('gemini-2.0-flash') : openai('gpt-4o');
}