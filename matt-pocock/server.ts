import { Hono } from 'hono';
import { google } from '@ai-sdk/google';
import { serve } from '@hono/node-server';
import { once } from 'node:events';
import { generateText, type ModelMessage } from 'ai';
 
const model = google('gemini-2.5-flash-lite');

export const startServer = async () => {
  const app = new Hono();

  app.post('/api/get-completions', async ctx => {
    const messages: ModelMessage[] = await ctx.req.json();

    const result = await generateText({
      model,
      messages,
    });

    return ctx.json(result.response.messages);
  });

  const server = serve({
    fetch: app.fetch,
    port: 4317,
    hostname: '0.0.0.0',
  });

  await once(server, 'listening');

  return server;
};