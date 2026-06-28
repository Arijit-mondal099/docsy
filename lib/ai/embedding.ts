import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
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

export async function processPdf(
  pdfUrl: string,
  documentId: string,
): Promise<number> {
  const embeddings = getEmbeddings();

  // Fetch PDF
  const response = await fetch(pdfUrl);
  const pdfBlob = await response.blob();

  // Load PDF
  const loader = new PDFLoader(pdfBlob, {
    splitPages: true,
  });
  const docs = await loader.load();

  // Split into chunks
  const chunks = await textSplitter.splitDocuments(docs);

  if (chunks.length === 0) {
    return 0;
  }

  // Generate embeddings and prepare vectors
  const vectors: PineconeRecord<ChunkMetadata>[] = await Promise.all(
    chunks.map(async (chunk, i) => {
      const [embedding] = await embeddings.embedDocuments([chunk.pageContent]);
      return {
        id: `${documentId}-chunk-${i}`,
        values: embedding,
        metadata: {
          documentId,
          text: chunk.pageContent,
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