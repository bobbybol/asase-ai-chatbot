import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { streamText } from 'hono/streaming';
import { streamText as generateStream, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import { unified } from 'unified';
import { PrismaClient } from '@prisma/client';

import ChatPage from './pages/chat';
import UnicornPage from './pages/unicorn';

const prisma = new PrismaClient();

const googleModel = google('gemini-3.5-flash');
const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/unicorn', (c) => c.html(<UnicornPage />));

app.get('/:chatid?', async (c) => {
  const { chatid } = c.req.param();

  if (!chatid) {
    const createdChat = await prisma.chat.create({
      data: {},
    });

    const chatId = createdChat.id;

    return c.redirect(`/${chatId}`);
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatid },
    include: { messages: true },
  });

  if (!chat) {
    c.status(404);
    return c.html(<h1>Chat not found</h1>);
  }

  const chats = await prisma.chat.findMany({
    select: { id: true, title: true },
  });

  for (const message of chat.messages) {
    const htmlFile = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .process(message.content);

    message.content = htmlFile.toString();
  }

  // retrieve the chat history for the provided chatid from the database
  return c.html(
    <ChatPage chatId={chat.id} messages={chat.messages} chats={chats} />
  );
});

app.post('/chat-title', async (c) => {
  const { chatId, userPrompt } = await c.req.json();

  const { text } = await generateText({
    system: `Do NOT wrap the title in any quotes or special characters. 
    Do NOT format the text as markdown, JSON or anything else. Give me some raw text`,
    model: googleModel,
    prompt: `Generate a very short title based on the following prompt or question sent by the user: """${userPrompt}""".`,
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: {
      title: text,
    },
  });

  return c.json({ title: text });
});

app.post('/chat', async (c) => {
  const { history, chatId } = await c.req.json();
  const userMessage = history[history.length - 1];

  // save the user message to the database
  await prisma.chatMessage.create({
    data: {
      chatId,
      role: 'user',
      content: userMessage.content,
    },
  });

  const { textStream } = generateStream({
    model: googleModel,
    messages: history,
    system: 'You write simple, clear, and concise content',
    maxOutputTokens: 4096,
    temperature: 0.3,
  });

  let completeMessage = '';

  return streamText(c, async (stream) => {
    for await (const chunk of textStream) {
      // chunk may be either an incremental delta or the full updated text.
      // If the incoming chunk already contains the previously-accumulated
      // message, replace instead of appending to avoid duplication.
      const incoming = String(chunk);
      if (!completeMessage) {
        completeMessage = incoming;
      } else if (incoming.includes(completeMessage)) {
        completeMessage = incoming;
      } else {
        completeMessage += incoming;
      }

      const htmlFile = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(completeMessage);

      stream.write(htmlFile.toString());
    }

    await prisma.chatMessage.create({
      data: {
        chatId,
        role: 'assistant',
        content: completeMessage,
      },
    });
  });
});

export default app;