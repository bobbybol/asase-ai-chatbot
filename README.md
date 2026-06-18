# Asase AI Chatbot

A full-stack AI chat application built with Bun, Hono, and the [Vercel AI SDK](https://sdk.vercel.ai). Named after Asase, the Earth goddess in Akan mythology, it provides a persistent, multi-session chat interface that can use any LLM provider—with streaming responses, markdown rendering, and automatic conversation titling.

## Features

- **Multi-chat sessions** — Create and switch between conversations via URL-based routing (`/:chatId`)
- **Streaming responses** — Token-by-token output rendered as HTML in real time
- **Persistent history** — Messages stored in SQLite via Prisma
- **Auto-generated titles** — First user message triggers an LLM-generated chat title
- **Markdown & code highlighting** — Assistant output parsed through a unified/remark/rehype pipeline

## Architecture

The app uses a **server-rendered shell with client hydration** pattern:

1. Hono renders the initial page and chat history on the server (JSX)
2. Initial state is passed to the client via inline `window` globals
3. A Hono JSX DOM client takes over for interactive chat and streaming updates

```
┌─────────────┐     SSR (Hono JSX)      ┌──────────────┐
│   Browser   │ ◄────────────────────── │  app.tsx     │
│             │                         │  (Hono API)  │
│  chat.tsx   │ ── POST /chat (stream) ►│              │
│  (JSX DOM)  │ ── POST /chat-title ───►│  Prisma/SQLite│
└─────────────┘                         └──────────────┘
                              │
                              ▼
                    LLM provider (AI SDK)
```

### API routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/:chatId?` | Renders chat UI; creates a new chat when no ID is provided |
| `POST` | `/chat` | Streams an assistant response for the given message history |
| `POST` | `/chat-title` | Generates and persists a short title from the first user message |
| `GET` | `/unicorn` | Easter-egg demo page |

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | [Bun](https://bun.sh) |
| Web framework | [Hono](https://hono.dev) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) — provider-agnostic; swap in any supported LLM |
| Database | [Prisma](https://www.prisma.io) + SQLite |
| UI | Hono JSX (server) + Hono JSX DOM (client) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) |
| Markdown | [unified](https://github.com/unifiedjs/unified), remark, rehype, highlight.js |
| Dev server | [Vite](https://vitejs.dev) + [@hono/vite-dev-server](https://github.com/honojs/vite-dev-server) |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2
- An API key for your chosen LLM provider (the default setup uses Google via `@ai-sdk/google`)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/bobbybol/asase-ai-chatbot.git
cd asase-ai-chatbot
bun install
```

### 2. Configure environment

Copy the example env file and add your provider API key:

```bash
cp .env.example .env
```

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here  # default provider; replace with your chosen LLM's key
```

### 3. Set up the database

```bash
bunx prisma generate
bunx prisma migrate dev
```

This creates `prisma/app.db` and applies the initial migration.

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). A new chat session is created automatically and you are redirected to `/:chatId`.

### Production build

Build client assets for production (served from `/static/`):

```bash
bun run build
```

In production mode, the app loads bundled JS/CSS from `static/` instead of the Vite dev pipeline.

## Project structure

```
├── app.tsx              # Hono server — routes, AI streaming, Prisma
├── pages/
│   ├── chat.tsx         # Server-rendered chat page shell
│   ├── unicorn.tsx      # Demo page
│   └── shared/
│       └── layout.tsx   # HTML layout, Tailwind, highlight.js theme
├── client/
│   ├── chat.tsx         # Client-side chat UI (Hono JSX DOM)
│   └── base.css         # Tailwind entry
├── prisma/
│   ├── schema.prisma    # Chat & ChatMessage models
│   └── migrations/
├── matt-pocock/         # Standalone AI SDK workshop scripts (see below)
└── vite.config.ts       # Vite + Hono dev server + Tailwind
```

## Workshop scripts

The `matt-pocock/` directory contains standalone exercises for exploring the Vercel AI SDK—tool calling, embeddings, classification, image generation, and related patterns. These scripts are independent of the web app and can be run directly:

```bash
bun matt-pocock/main.ts
bun matt-pocock/tool-loop.ts
# etc.
```

Each file is self-contained and expects the relevant provider API key in the environment.

## Patterns & design notes

- **URL as session key** — Chat identity lives in the path (`/:chatId`), not cookies or local storage
- **Stream-to-HTML** — Markdown is converted to HTML on every chunk during streaming so the client can render incrementally via `dangerouslySetInnerHTML`
- **Dual asset pipeline** — `import.meta.env.DEV` switches between Vite HMR (`/client/*`) and pre-built bundles (`/static/*`)
- **Strict TypeScript** — `strict` mode with Hono's JSX import source configured in `tsconfig.json`
