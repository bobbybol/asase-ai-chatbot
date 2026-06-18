import { config } from 'dotenv';
import { google } from '@ai-sdk/google';
import { embedMany, embed, cosineSimilarity } from 'ai';

config();

const model = google.embedding('gemini-embedding-2-preview');

const values = ["Dog", "Cat", "Car", "Bike"];

const { embeddings } = await embedMany({
  model,
  values,
});

const vectorDatabase = embeddings.map(
  (embedding, index) => ({
    value: values[index],
    embedding,
  }),
)

const searchTerm = await embed({
  model,
  value: 'Canine',
});

const entries = vectorDatabase.map(entry => {
  return {
    value: entry.value,
    similarity: cosineSimilarity(
      entry.embedding,
      searchTerm.embedding,
    )
  };
});

const sortedEntries = entries.sort(
  (a, b) => b.similarity - a.similarity
)

console.dir(sortedEntries, { depth: null });