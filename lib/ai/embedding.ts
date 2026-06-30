import { extractText } from 'unpdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { getPineconeIndex, getDocumentNamespace } from './pinecone';
import { embeddingModel } from './openai';
import type { PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';

interface ChunkMetadata extends RecordMetadata {
  documentId: string;
  text: string;
  chunkIndex: number;
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

let embeddingsInstance: OpenAIEmbeddings | null = null;

function getEmbeddings(): OpenAIEmbeddings {
  if (!embeddingsInstance) {
    embeddingsInstance = new OpenAIEmbeddings({
      model: embeddingModel,
      dimensions: 768,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return embeddingsInstance;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const embeddings = getEmbeddings();
  const [vector] = await embeddings.embedDocuments([text]);
  return vector;
}

export async function processPdf(pdfUrl: string, documentId: string): Promise<number> {
  const embeddings = getEmbeddings();

  // Fetch PDF
  const response = await fetch(pdfUrl);
  const pdfBuffer = new Uint8Array(await response.arrayBuffer());

  // Extract text using unpdf (pure JS, no native deps - works on Vercel)
  const { text } = await extractText(pdfBuffer);

  // unpdf returns string[] (one per page), join into single string
  const fullText = Array.isArray(text) ? text.join('\n\n') : text;

  if (!fullText || fullText.trim().length === 0) {
    return 0;
  }

  // Split into chunks
  const chunks = await textSplitter.splitText(fullText);

  if (chunks.length === 0) {
    return 0;
  }

  // Generate embeddings and prepare vectors
  const vectors: PineconeRecord<ChunkMetadata>[] = await Promise.all(
    chunks.map(async (chunkText, i) => {
      const [embedding] = await embeddings.embedDocuments([chunkText]);
      return {
        id: `${documentId}-chunk-${i}`,
        values: embedding,
        metadata: {
          documentId,
          text: chunkText,
          chunkIndex: i,
        },
      };
    }),
  );

  // Upsert to Pinecone
  const index = getPineconeIndex();
  const namespaceName = getDocumentNamespace(documentId);

  // Upsert in batches of 100
  for (let i = 0; i < vectors.length; i += 100) {
    await index.upsert({
      records: vectors.slice(i, i + 100),
      namespace: namespaceName,
    });
  }

  return chunks.length;
}
