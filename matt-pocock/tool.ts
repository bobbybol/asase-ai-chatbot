import { config } from 'dotenv';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { tool, generateText } from "ai";

config();

const model = google('gemini-2.5-flash-lite');

const logToConsoleTool = tool({
  description: 'Log a message to the console',

  inputSchema: z.object({
    message: z
      .string()
      .describe('The message to log to the console')
  }),

  execute: async({ message }) => {
    console.log(message);
  },
});

const logToConsole = async (prompt: string) => {
  const { steps } = await generateText({
    model,
    prompt,
    system: 'Your only role in life is to log messages to the console. Use the tool provided to log the prompt to the console.',
    tools: {
      logToConsole: logToConsoleTool
    }
  });

  console.dir(steps[0]?.toolCalls, { depth: null });
};

logToConsole('poepjes');
