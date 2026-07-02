import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { getPineconeIndex, getDocumentNamespace } from './pinecone';
import { getEmbedding } from './embedding';

export type ChunkResult = {
  text: string;
  documentId: string;
  chunkIndex: number;
};

export async function searchDocumentChunks(
  query: string,
  documentId: string,
  topK = 5,
): Promise<ChunkResult[]> {
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

  // Extract text from results, filtered to the requested documentId
  return (
    results.matches
      ?.filter((match) => match.metadata?.documentId === documentId)
      .map((match) => ({
        text: match.metadata?.text as string,
        documentId: match.metadata?.documentId as string,
        chunkIndex: (match.metadata?.chunkIndex as number) ?? -1,
      }))
      .filter((chunk) => chunk.text) ?? []
  );
}

export function getChatModel(useFallback = false) {
  return useFallback ? google('gemini-2.0-flash') : openai('gpt-4o');
}
