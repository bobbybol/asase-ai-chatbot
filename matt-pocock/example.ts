import { google } from '@ai-sdk/google';
import { streamText, type ModelMessage } from 'ai';

const model = google('gemini-2.5-flash-lite');

/**
 * Simple stream
 */

const answerMyQuestion = async (
  prompt: string
) => {
  const { textStream } = streamText({
    model,
    prompt,
  });

  for await (const text of textStream) {
    process.stdout.write(text);
  }

  return textStream;
};
// answerMyQuestion('What is the color of the sun?');

/**
 * Message History
 */

const exampleMessages: ModelMessage[] = [
  {
    role: 'system',
    content: 'You are a friendly greeter.'
  },
  {
    role: 'user',
    content: 'Hello, you!'
  },
  {
    role: 'assistant',
    content: 'Hi there!',
    providerOptions: { /* Provider specific options */ }, 
  }
];

