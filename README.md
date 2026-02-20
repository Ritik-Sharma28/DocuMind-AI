# 🧠 DocuMind AI

**AI-Powered Knowledge Base with Retrieval-Augmented Generation (RAG)**

Upload documents → Ask questions → Get accurate answers with source citations

![MERN](https://img.shields.io/badge/MERN-Stack-green)
![LangChain](https://img.shields.io/badge/LangChain.js-RAG-blue)
![Pinecone](https://img.shields.io/badge/Pinecone-VectorDB-purple)
![Gemini](https://img.shields.io/badge/Gemini-1.5--Flash-orange)

## ✨ Features

- 📄 **Multi-format Upload** — PDF, DOCX, TXT, Markdown
- 🔪 **Smart Chunking** — Recursive text splitting with configurable overlap
- 🧮 **Vector Embeddings** — Google Gemini `text-embedding-004` → Pinecone
- 🔍 **RAG Pipeline** — Semantic search + LLM generation via LangChain.js
- 💬 **Streaming Chat** — Real-time token streaming via Server-Sent Events
- 📎 **Source Citations** — Every answer shows which documents were used
- 🔐 **Auth** — JWT authentication with bcrypt password hashing
- 🛡️ **Security** — Helmet, CORS, rate limiting, input validation
- 📊 **Dashboard** — Document stats, processing status, management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │  Auth    │  │ Upload   │  │   Chat (SSE Stream) │    │
│  │  Pages   │  │ Dropzone │  │   + Source Citations│    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │  REST + SSE
┌───────────────────────▼─────────────────────────────────┐
│                EXPRESS.JS  API SERVER                    │
│  ┌─────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Auth   │  │   Document   │  │   RAG Service    │   │
│  │  JWT    │  │   Processor  │  │  (LangChain.js)  │   │
│  └─────────┘  └──────┬───────┘  └──────┬───────────┘   │
│                       │                 │               │
│              ┌────────▼──┐    ┌─────────▼──────────┐    │
│              │  Chunker  │    │  Embedding Service │    │
│              │ (Overlap) │    │  (Gemini + Query)  │    │
│              └───────────┘    └────────────────────┘    │
└──────┬────────────────────────────────┬─────────────────┘
       │                                │
┌──────▼──────┐                ┌────────▼────────┐
│  MongoDB    │                │    Pinecone     │
│  Users      │                │  Vector Store   │
│  Documents  │                │  Embeddings     │
│  Chats      │                │  Metadata       │
└─────────────┘                └─────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Vector DB | Pinecone (serverless) |
| GenAI | LangChain.js, Google Gemini 1.5 Flash |
| Embeddings | Google Gemini `text-embedding-004` (768 dimensions) |
| Auth | JWT + bcrypt |
| Streaming | Server-Sent Events (SSE) |
| File Processing | pdf-parse, mammoth |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (or use Docker)
- [Pinecone free account](https://www.pinecone.io/) — create an index named `documind` with dimension **768** and metric **cosine**
- Google Gemini API key (Google AI Studio)

### Steps

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/documind-ai.git
cd documind-ai

# 2. Start MongoDB
docker compose up -d

# 3. Setup server
cd server
cp ../.env.example .env        # fill in your keys
npm install
npm run dev

# 4. Setup client (new terminal)
cd client
npm install
npm run dev

# 5. Open http://localhost:5173
```

## 🔑 Key Engineering Decisions

1. **Recursive Text Splitting**: Custom implementation that respects
   paragraph/sentence boundaries with configurable overlap for context
   preservation across chunk boundaries.

2. **Namespace Isolation**: Each user's vectors are stored in a separate
   Pinecone namespace, ensuring data isolation without separate indexes.

3. **Streaming Architecture**: SSE chosen over WebSockets for the
   unidirectional LLM token stream — simpler, HTTP-native, auto-reconnect.

4. **Async Document Processing**: Upload returns immediately; chunking,
   embedding, and vector storage happen asynchronously with status tracking.

5. **LCEL Chains**: Using LangChain Expression Language (LCEL)
   `RunnableSequence` for composable, type-safe RAG pipeline construction.

## 📄 License

MIT
