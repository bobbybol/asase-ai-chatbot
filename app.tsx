import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

import ChatPage from './pages/chat';

const googleModel = google('gemini-2.5-flash');
const app = new Hono();

app.use('static/*', serveStatic({ root: './' }));

app.post('/chat', async ({ req, json }) => {
  const { prompt } = await req.json();
  try {
    const { text, finishReason } = await generateText({
      model: googleModel,
      prompt,
      system: 'You write simple, clear, and concise content',
      maxOutputTokens: 4096,
      temperature: 0.3,
    })
    console.log('Finished because', finishReason);
    return json({ text })
  }
  catch(err) {
    console.error(err);
  }
});
app.get('/', c => c.html(<ChatPage />))

export default app;
