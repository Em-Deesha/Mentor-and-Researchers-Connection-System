# Academic RAG Smart Matching System

This document explains how to set up and run the RAG (Retrieval-Augmented Generation) backend for the Academic Smart Matching system.

## 🏗️ Architecture Overview

```
Frontend (React) → RAG Backend (Node.js) → Vector Database (ChromaDB) → LLM (Simulated)
     ↓                    ↓                        ↓                    ↓
Port 3000            Port 3001                Port 8000            HuggingFace
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Docker (for ChromaDB)
- npm or yarn

### Step 1: Install RAG Backend Dependencies

```bash
cd rag-backend
npm install
```

### Step 2: Start ChromaDB (Vector Database)

```bash
# Start ChromaDB in Docker
docker run -p 8000:8000 chromadb/chroma
```

### Step 3: Build Vector Index

```bash
# In the rag-backend directory
npm run build-index
```

### Step 4: Start RAG Backend

```bash
# Start the RAG backend server
npm start
```

### Step 5: Test the System

1. **Start the React frontend** (in the main directory):
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:3000`

3. **Navigate to the Matchmaker tab**

4. **Try a smart search** like:
   - "I'm interested in quantum machine learning"
   - "I work on CRISPR gene editing for cancer"
   - "I study renewable energy storage systems"

## 🔧 Detailed Setup

### RAG Backend Configuration

The RAG backend uses the following technologies:

- **Express.js**: Web server framework
- **ChromaDB**: Vector database for similarity search
- **HuggingFace Embeddings**: Text-to-vector conversion
- **LangChain**: Document processing and chunking

### Environment Variables

Create a `.env` file in the `rag-backend` directory:

```env
PORT=3001
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

### API Endpoints

#### POST /smart-match

**Request:**
```json
{
  "query": "I'm interested in quantum machine learning applications"
}
```

**Response:**
```json
[
  {
    "id": "prof_002",
    "name": "Dr. Michael Rodriguez",
    "title": "Associate Professor of Physics",
    "university": "MIT",
    "researchArea": "Quantum Computing and Quantum Information",
    "justification": "Dr. Rodriguez specializes in quantum computing research, making them a perfect match for your quantum computing interests...",
    "similarityScore": 0.92
  }
]
```

#### GET /health

Returns server health status.

## 🧠 How RAG Smart Matching Works

### 1. Document Processing
- Professor profiles are converted into rich text documents
- Text is split into semantic chunks
- Each chunk is embedded using HuggingFace's sentence transformer

### 2. Vector Indexing
- Chunks are stored in ChromaDB with metadata
- Vector similarity search enables semantic matching
- Metadata includes professor information and chunk context

### 3. Query Processing
- User queries are converted to embeddings
- Similarity search finds relevant chunks
- Retrieved chunks are grouped by professor

### 4. Smart Response Generation
- Simulated LLM generates contextual justifications
- Matches are ranked by similarity score
- Top 3 matches are returned with explanations

## 📊 Professor Data

The system includes 8 sample professors with diverse research areas:

1. **Dr. Sarah Chen** - Machine Learning & AI (Stanford)
2. **Dr. Michael Rodriguez** - Quantum Computing (MIT)
3. **Dr. Emily Watson** - Synthetic Biology (Harvard)
4. **Dr. James Park** - Nanomaterials & Energy (UC Berkeley)
5. **Dr. Lisa Thompson** - Cognitive Neuroscience (Yale)
6. **Dr. Robert Kim** - Applied Mathematics (Princeton)
7. **Dr. Maria Gonzalez** - Climate Change & Sustainability (UC Santa Barbara)
8. **Dr. David Lee** - Robotics & Autonomous Systems (Caltech)

## 🔍 Testing Smart Matching

Try these example queries to test the system:

### Machine Learning Queries
- "I'm working on deep learning for natural language processing"
- "I need help with transformer models and attention mechanisms"
- "I'm interested in AI applications in healthcare"

### Quantum Computing Queries
- "I study quantum algorithms and error correction"
- "I'm working on quantum machine learning applications"
- "I need expertise in quantum cryptography"

### Biology Queries
- "I work on CRISPR gene editing for cancer therapy"
- "I'm interested in synthetic biology applications"
- "I study genetic engineering for therapeutic purposes"

### Energy & Materials Queries
- "I research next-generation battery technologies"
- "I work on nanomaterials for energy storage"
- "I'm interested in renewable energy systems"

## 🐛 Troubleshooting

### Common Issues

1. **ChromaDB Connection Error**
   ```bash
   # Make sure ChromaDB is running
   docker ps | grep chroma
   ```

2. **RAG Backend Not Responding**
   ```bash
   # Check if backend is running
   curl http://localhost:3001/health
   ```

3. **No Search Results**
   - Ensure the vector index is built: `npm run build-index`
   - Check that ChromaDB is accessible
   - Verify professor data is loaded

4. **Frontend Connection Error**
   - Make sure RAG backend is running on port 3001
   - Check browser console for CORS errors
   - Verify network connectivity

### Debug Mode

Run the RAG backend in debug mode:

```bash
DEBUG=* npm start
```

## 🔄 Development Workflow

### Adding New Professors

1. Edit `rag-backend/data/professors.json`
2. Rebuild the index: `npm run build-index`
3. Restart the backend: `npm start`

### Modifying Matching Logic

1. Edit `rag-backend/index.js`
2. Modify the `generateJustification()` function
3. Restart the backend

### Updating Frontend

1. Edit `src/App.jsx`
2. The Vite dev server will auto-reload
3. Test the integration

## 📈 Performance Considerations

- **Vector Index Size**: ~8 professors = ~50 chunks
- **Query Response Time**: < 2 seconds
- **Memory Usage**: ~100MB for ChromaDB
- **Concurrent Users**: Supports multiple simultaneous queries

## 🚀 Production Deployment

For production deployment:

1. **Use a production ChromaDB instance**
2. **Set up proper environment variables**
3. **Configure CORS for your domain**
4. **Add authentication/rate limiting**
5. **Use a real LLM API (OpenAI, Anthropic, etc.)**

## 📚 Further Reading

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [LangChain Documentation](https://python.langchain.com/)
- [HuggingFace Transformers](https://huggingface.co/docs/transformers/)
- [RAG Architecture Patterns](https://docs.aws.amazon.com/sagemaker/latest/dg/jumpstart-foundation-models-rag.html)
