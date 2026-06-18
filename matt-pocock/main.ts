import { type ModelMessage } from "ai";
import { startServer } from "./server";
import { config } from 'dotenv';

config();

const messagesToSend: ModelMessage[] = [
  {
    role: 'user',
    content: "What's the capital of Wales?",
  }
];

await startServer();

const response = await fetch(
  'http://localhost:4317/api/get-completions',
  {
    method: 'POST',
    body: JSON.stringify(messagesToSend),
    headers: {
      "Content-Type": "application/json"
    },
  }
)

const newMessages = (await response.json()) as ModelMessage[];

const allMessages = [
  ...messagesToSend,
  ...newMessages,
];

console.dir(allMessages, { depth: null });
