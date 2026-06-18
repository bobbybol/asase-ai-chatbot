import { config } from 'dotenv';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { generateText, Output } from "ai";

config();

const model = google('gemini-2.5-flash-lite');

export const classifySentiment = async (text: string) => {
  const { output } = await generateText({
    model,
    prompt: text,
    output: Output.object({
      schema: z.enum([ 'positive', 'negative', 'neutral' ]),
    }),
    system: 'Classify the sentiment of the text as either positive, negative, or neutral',
  });

  return output;
};

const result = await classifySentiment(`I'm not sure how I feel..`);

console.log(result);
