import { config } from 'dotenv';
import { google } from '@ai-sdk/google';
import { generateText } from "ai";
import { readFileSync } from 'fs';
import path from 'path';

config();

const model = google('gemini-3.5-flash');

const systemPrompt = "You will receive an image. Please create an alt text for the image. Be concise. Use adjectives only when necessary. Do not pass 160 characters. Use simple language."

export const describeImage = async(imageUrl: string) => {
  // const imageAsUint8Array = readFileSync(imagePath);
  
  const { text } = await generateText({
    model,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: new URL(imageUrl),
          }
        ],
      },
    ],
  });
  return text;
}

const description = await describeImage(
  // path.join(import.meta.dirname, './hobo.jpeg'),
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrsPdrzhXzweK6GQ1VYJc_IwueDRdqZrwUow&s'
);

console.log(description);
// An older man sits by a grill with a "Summer Lunch Hobo" sign while a line of people in martial arts uniforms wait for food with plates.