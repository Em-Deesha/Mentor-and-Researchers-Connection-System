# 🤖 RAG Backend Setup Guide

Complete guide to set up the RAG (Retrieval-Augmented Generation) backend with Google Gemini AI integration.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key
- Firebase project (see [FIREBASE-SETUP.md](./FIREBASE-SETUP.md))

## 🚀 Step 1: Install Backend Dependencies

1. **Navigate to Backend Directory**
```bash
cd rag-backend
   ```

2. **Install Dependencies**
   ```bash
npm install
```

3. **Verify Installation**
```bash
   npm list
   ```

## 🔑 Step 2: Get Google Gemini API Key

1. **Go to Google AI Studio**
   - Visit [https://aistudio.google.com/](https://aistudio.google.com/)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Get API Key" in the left sidebar
   - Click "Create API Key"
   - Select your project or create a new one
   - Copy the generated API key

3. **API Key Permissions**
   - Ensure the API key has access to Gemini API
   - Note the usage limits and quotas

## ⚙️ Step 3: Environment Configuration

1. **Create Environment File**
```bash
   cd rag-backend
   touch .env
   ```

2. **Configure Environment Variables**
   ```env
   # Gemini AI Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Server Configuration
   PORT=3003
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   
   # Firebase Configuration (if needed for backend)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3004
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Generate JWT Secret**
```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

## 🏗️ Step 4: Backend Structure Overview

```
rag-backend/
├── production-index-fallback.js  # Main server file
├── firestore-integration.js       # Firestore data access
├── package.json                   # Dependencies
├── .env                          # Environment variables
└── production.env                # Production environment
```

## 🔧 Step 5: Configure CORS

1. **Update CORS Settings**
   The backend includes comprehensive CORS configuration:
   ```javascript
   const corsOptions = {
     origin: [
       'http://localhost:3000',
       'http://localhost:3001', 
       'http://localhost:3004',
       'https://your-production-domain.com'
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
   };
   ```

2. **Add Your Domains**
   - Update the `origin` array with your frontend URLs
   - Add production domains when deploying

## 🚀 Step 6: Start the Backend Server

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Production Mode**
   ```bash
   npm start
   ```

3. **Verify Server is Running**
   ```bash
   curl http://localhost:3003/health
   ```
   Expected response:
```json
{
     "status": "OK",
     "timestamp": "2025-01-XX...",
     "uptime": "XX seconds"
   }
   ```

## 🧪 Step 7: Test API Endpoints

### Health Check
```bash
curl http://localhost:3003/health
```

### Smart Matching (Requires Authentication)
```bash
curl -X POST http://localhost:3003/smart-match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "researchInterests": "Machine Learning, AI, Data Science",
    "userType": "student"
  }'
```

### Authentication
```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

## 🔐 Step 8: Authentication Setup

1. **JWT Configuration**
   - The backend uses JWT for API authentication
   - Tokens are generated during user login
   - Include token in Authorization header for protected routes

2. **Token Structure**
   ```javascript
   {
     "userId": "user_id",
     "email": "user@example.com",
     "userType": "student|professor|admin",
     "iat": "issued_at_timestamp",
     "exp": "expiration_timestamp"
   }
   ```

## 🤖 Step 9: Gemini AI Integration

1. **API Configuration**
   ```javascript
   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
   ```

2. **Smart Matching Prompt**
   ```javascript
   const prompt = `
   You are an AI assistant that helps match students with professors based on research interests.
   
   Student Research Interests: ${researchInterests}
   Available Professors: ${professorsData}
   
   Please provide:
   1. Top 3 matching professors
   2. Match confidence percentage
   3. Detailed explanation for each match
   4. Suggested collaboration topics
   `;
   ```

3. **Response Processing**
   - Parse AI responses
   - Extract match data
   - Format for frontend consumption

## 📊 Step 10: Database Integration

1. **Firestore Connection**
   ```javascript
   const admin = require('firebase-admin');
   
   const serviceAccount = {
     projectId: process.env.FIREBASE_PROJECT_ID,
     privateKey: process.env.FIREBASE_PRIVATE_KEY,
     clientEmail: process.env.FIREBASE_CLIENT_EMAIL
   };
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });
   ```

2. **Data Access Functions**
   - `getProfessors()` - Fetch all professors
   - `getStudents()` - Fetch all students
   - `getUserProfile(userId)` - Get specific user profile
   - `updateUserProfile(userId, data)` - Update user profile

## 🛡️ Step 11: Security Configuration

1. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP'
   });
   ```

2. **Security Headers**
   ```javascript
   const helmet = require('helmet');
   
   app.use(helmet({
     contentSecurityPolicy: false,
     crossOriginEmbedderPolicy: false
   }));
   ```

3. **Input Validation**
   - Validate all incoming requests
   - Sanitize user inputs
   - Check request body structure

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3003
   lsof -i :3003
   
   # Kill the process
   kill -9 PID
   ```

2. **Gemini API Errors**
   - Check API key validity
   - Verify API quotas
   - Check request format

3. **Firebase Connection Issues**
   - Verify service account credentials
   - Check Firebase project ID
   - Ensure Firestore is enabled

4. **CORS Errors**
   - Check allowed origins
   - Verify frontend URL
   - Check credentials setting

### Debug Steps

1. **Check Server Logs**
   ```bash
   # View real-time logs
   npm run dev
   
   # Check error logs
   tail -f logs/error.log
   ```

2. **Test Individual Components**
   ```bash
   # Test Gemini API
   node -e "
   const { GoogleGenerativeAI } = require('@google/generative-ai');
   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   console.log('Gemini API initialized successfully');
   "
   ```

3. **Verify Environment Variables**
   ```bash
   # Check if .env is loaded
   node -e "console.log(process.env.GEMINI_API_KEY ? 'API Key loaded' : 'API Key missing')"
   ```

## 📈 Performance Optimization

1. **Caching**
   - Implement Redis for session storage
   - Cache professor data
   - Cache AI responses

2. **Database Optimization**
   - Use Firestore indexes
   - Optimize queries
   - Implement pagination

3. **API Optimization**
   - Implement request batching
   - Use connection pooling
   - Optimize response sizes

## 🔄 Step 12: Production Deployment

1. **Environment Setup**
   ```bash
   # Create production environment file
   cp .env production.env
   
   # Update production values
   NODE_ENV=production
   PORT=3003
   ```

2. **Process Management**
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   
   # Start with PM2
   pm2 start production-index-fallback.js --name "rag-backend"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

3. **Monitoring**
   ```bash
   # Monitor with PM2
   pm2 monit
   
   # View logs
   pm2 logs rag-backend
   ```

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/smart-match` | AI-powered matching | Yes |
| POST | `/auth/login` | User authentication | No |
| POST | `/auth/verify` | Token verification | Yes |

### Request/Response Examples

**Smart Matching Request:**
```json
{
  "researchInterests": "Machine Learning, AI, Data Science",
  "userType": "student"
}
```

**Smart Matching Response:**
```json
{
  "matches": [
    {
      "professorId": "prof_123",
      "name": "Dr. Jane Smith",
      "confidence": 95,
      "explanation": "Strong match in AI research areas",
      "collaborationTopics": ["Deep Learning", "Neural Networks"]
    }
  ],
  "totalMatches": 3
}
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Check dependencies
npm audit
```

## 📊 Monitoring & Logging

1. **Log Levels**
   - ERROR: Critical errors
   - WARN: Warning messages
   - INFO: General information
   - DEBUG: Detailed debugging

2. **Log Files**
   - `logs/error.log` - Error logs
   - `logs/access.log` - Access logs
   - `logs/combined.log` - All logs

3. **Health Monitoring**
   - Endpoint: `/health`
   - Response time monitoring
   - Memory usage tracking

---

**Next Steps:** After completing RAG backend setup, start both frontend and backend servers to test the complete application.