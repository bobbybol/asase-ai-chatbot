import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { streamText } from 'hono/streaming';
import { streamText as streamAiText } from 'ai';
import { google } from '@ai-sdk/google';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import { unified } from 'unified';

import ChatPage from './pages/chat';

const googleModel = google('gemini-3.5-flash');
const app = new Hono();

app.use('static/*', serveStatic({ root: './' }));

app.post('/chat', async ctx => {
  const { prompt, history } = await ctx.req.json();
  try {
    console.log('=== PROMPT ===', prompt);
    console.log('=== HISTORY ===', history)
    const { textStream } = streamAiText({
      model: googleModel,
      messages: history,
      system: 'You write simple, clear, and concise content',
      maxOutputTokens: 4096,
      temperature: 0.3,
    });

    // return streamResult.toTextStreamResponse();

    // const lala = await finishReason;
    // console.log(lala);
    let completeMessage = '';
    
    return streamText(ctx, async stream => {
      for await(const chunk of textStream) {
        // console.log('=== COMPLETE MESSAGE B ===', completeMessage);
        // console.log('=== CHUNK ===', chunk);
        // completeMessage += chunk;
        // console.log('=== COMPLETE MESSAGE A ===', completeMessage);
        const htmlFile = await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeHighlight)
          .use(rehypeStringify)
          .process(completeMessage)
        ;
        stream.write(htmlFile.toString());
      }
    })
  }
  catch(err) {
    console.error('=== ERROR ===', err);
  }
});

app.get('/', c => c.html(<ChatPage />))

export default app;
