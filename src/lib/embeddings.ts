import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

export async function splitDocumentIntoChunks(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const chunks = await splitter.splitText(text);
  return chunks;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];

  for (const text of texts) {
    const embedding = await embeddings.embedQuery(text);
    results.push(embedding);
  }

  return results;
}

export async function generateSingleEmbedding(text: string): Promise<number[]> {
  return embeddings.embedQuery(text);
}

export function calculateCosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}
