# 🧠 DocuMind AI

DocuMind AI is a full-stack, AI-powered document analysis and chat application. It allows users to securely upload PDF documents and engage in intelligent, context-aware conversations with their documents. Utilizing advanced Retrieval-Augmented Generation (RAG), DocuMind AI reads your files, generates semantic embeddings, and provides accurate answers based strictly on the uploaded content.

LINK :- https://documind-ai-pvqg.onrender.com/

## ✨ Key Features

- **🔐 Secure Authentication**: Robust user registration and login system utilizing JSON Web Tokens (JWT) and `bcrypt` password hashing.
- **📄 Document Processing**: Upload PDF files directly. The backend parses the text and chunks it intelligently for AI processing.
- **🤖 AI-Powered RAG Chat**: Chat with your documents. The app uses the **Google Gemini API** to generate embeddings and conversational responses, matched against a **Pinecone** vector database for highly contextual answers.
- **🚀 Advanced Rate Limiting**: Integration with **Redis** to actively monitor and limit daily API usage per user (e.g., 5 document uploads, 6 chats per day), preventing abuse and API cost overruns.
- **💅 Premium UI/UX**: Built with React and styled with Tailwind CSS to provide a modern, dark-themed, and responsive interface, including real-time loading states and humorous easter-egg error handlers.
- **🐳 Production Ready**: Fully Dockerized with a multi-stage, single-service architecture. The Node.js backend serves the optimized React frontend build, completely eliminating CORS and cookie issues in production environments like Render.

---

## 🛠️ Technology Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS (Styling)
- React Router (client-side routing)
- Axios & React Hot Toast

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose (User & Document Metadata Storage)
- Redis (Session blacklisting and Daily Rate Limits)
- JSON Web Tokens (JWT) for stateless authentication

**AI & Infrastructure**
- Google Gemini API (LLM & Embeddings generation)
- Pinecone (Vector Database)
- Docker & Docker Compose (Containerization)

---

## ⚙️ Architecture Workflow

1. **Upload**: A user uploads a PDF. The file is temporarily stored, and `pdf-parse` extracts the raw text.
2. **Chunking & Embedding**: The text is split into manageable semantic chunks. The Google Gemini API converts these chunks into dense vector embeddings.
3. **Vector Storage**: These vectors, along with document metadata, are upserted into the Pinecone database.
4. **Querying**: When a user asks a question in the chat, the query is converted into a vector. Pinecone is queried to find the most relevant document chunks (context).
5. **Generation**: The retrieved context and the user's question are sent to the Gemini LLM, which formulates a precise answer based *only* on the provided document context.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas URI)
- Redis Server (Running locally on port `6379` or via cloud)
- API Keys for Google Gemini and Pinecone.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/DocuMind-AI.git
cd "DocuMind AI"
```

### 2. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database configuration
MONGODB_URI=your_mongodb_connection_string
REDIS_PASSWORD=your_redis_password_if_any

# Security
JWT_SECRET=your_super_secret_jwt_key

# AI APIs
GEMINI_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=documind
```

### 3. Install Dependencies
You need to install packages for both the backend and frontend.
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Run the Development Servers
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🐳 Docker Production Deployment (Render / VPS)

This project is configured for a **Single-Service Architecture**, meaning the Node.js Express server will host the built static React files. This is optimal for hosting platforms like Render.

### Building and Running with Docker Locally

```bash
docker build -t documind-ai .
docker run -p 5000:5000 --env-file .env documind-ai
```
The app will be available at `http://localhost:5000`.

### Deploying to Render
1. Push this repository to GitHub.
2. Create a new **Web Service** on Render and connect the repository.
3. Render will automatically detect the `Dockerfile`.
4. Add your Environment variables inside the Render dashboard (you do not need `CLIENT_URL` in production).
5. Click **Deploy**. The Dockerfile will build the React app, configure the Express server, and serve everything over HTTPS.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
