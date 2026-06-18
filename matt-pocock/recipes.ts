import { config } from 'dotenv';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { streamText, Output } from "ai";

config();

const model = google('gemini-2.5-flash-lite');

const schema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      })
    ),
    steps: z.array(z.string()),
  })
});

const createRecipe = async (prompt: string) => {
  const _stream = streamText({
    model,
    prompt,
    output: Output.object({ schema }),
    system: "You are helping a user create a recipe. Use British English variants of ingredient names, like Coriander over Cilantro.",
  });

  for await (const obj of _stream.partialOutputStream) {
    console.clear();
    console.dir(obj, { depth: null });
  }

  const finalOutput = await _stream.output;
  return finalOutput.recipe;
};

const recipe = await createRecipe('How to make baba ganoush?');

// console.dir(recipe, { depth: null });
