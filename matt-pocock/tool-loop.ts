import { config } from 'dotenv';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { tool, streamText, stepCountIs } from "ai";

config();

const model = google('gemini-2.5-flash-lite');

const getWeatherTool = tool({
  description: 'Get the current weather in the specified city',
  inputSchema: z.object({
    city: z
      .string()
      .describe('The city to get the weather for')
  }),
  execute: async ({ city }) => {
    return `The weather in ${ city } is 25 degrees Celsius and sunny`;
  },
});

const askQuestion = async (prompt: string) => {
  const { textStream, text, steps } = streamText({
    model,
    prompt,
    // system: 'Your only role in life is to log messages to the console. Use the tool provided to log the prompt to the console.',
    tools: {
      getWeather: getWeatherTool
    },
    stopWhen: stepCountIs(5)
  });

  for await (const text of textStream) {
    // process.stdout.write(text);
    console.log('str', text)
  }
  // console.dir(await steps, { depth: null });

  // console.log('text', await text);

};

await askQuestion('What is the weather like in London?');
