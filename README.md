# 🎓 Mentor & Researchers Connection System

A comprehensive platform that connects students with professors using AI-powered smart matching, real-time chat, and collaborative features.

![GitHub stars](https://img.shields.io/github/stars/Em-Deesha/Mentor-and-Researchers-Connection-System)
![GitHub forks](https://img.shields.io/github/forks/Em-Deesha/Mentor-and-Researchers-Connection-System)
![GitHub license](https://img.shields.io/github/license/Em-Deesha/Mentor-and-Researchers-Connection-System)

> **Branch**: `adeesha-module` - Latest enhanced version with advanced chat system and AI integration

## 🌟 Features

### 🤖 AI-Powered Smart Matching
- **Gemini AI Integration**: Advanced natural language processing for research interest analysis
- **Intelligent Matching**: Find professors based on research area compatibility
- **Detailed Justifications**: AI explains why each match is relevant
- **Similarity Scoring**: Provides match confidence percentages

### 💬 Real-Time Chat System
- **WhatsApp-like Interface**: Modern chat UI with sidebar and main chat area
- **Real-time Messaging**: Instant message delivery using Firestore
- **Chat Management**: Pin, rename, and delete chat conversations
- **Notification System**: Real-time notifications with count badges
- **Message Persistence**: Chat history maintained across sessions

### 👥 Professional Profile System
- **Role-Based Access**: Student, Professor, and Admin roles with different permissions
- **Comprehensive Profiles**: Research areas, publications, skills, availability
- **Onboarding Flow**: Guided setup for new users
- **Profile Verification**: Professional status indicators

### 📱 Social Features
- **Global Feed**: Share research updates and discoveries
- **File Upload Support**: Share documents, images, and research materials
- **Social Interactions**: Like and comment on posts
- **Real-time Updates**: Live feed updates

### 🛠️ Admin Dashboard
- **User Analytics**: Track total users, posts, and activity
- **System Statistics**: Platform health and usage metrics
- **User Management**: Oversee platform activity
- **Recent Activity**: Monitor new users and posts

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive design
- **Firebase SDK** for authentication and real-time database
- **Lucide React** for beautiful icons

### Backend
- **Node.js/Express** RAG backend with AI integration
- **Google Gemini AI** for intelligent matching
- **Firebase Firestore** for real-time data storage
- **JWT Authentication** for secure API access
- **Rate Limiting & Security** with Helmet.js

## 📁 Project Structure

```
Mentor-and-Researchers-Connection-System/
├── src/
│   ├── App.jsx                    # Main application with all features
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Global styles and Tailwind
│   └── firebase-config.js         # Firebase configuration
├── rag-backend/
│   ├── production-index-fallback.js  # Main RAG backend server
│   ├── firestore-integration.js      # Firestore data access layer
│   ├── package.json                  # Backend dependencies
│   └── production.env               # Backend environment variables
├── cleanup-duplicate-chats.js     # Database cleanup utility
├── index.html                     # HTML template
├── package.json                   # Frontend dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── README.md                      # This file
├── FIREBASE-SETUP.md              # Firebase configuration guide
└── RAG-SETUP.md                   # Backend setup guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Firestore enabled
- Google Gemini API key

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Em-Deesha/Mentor-and-Researchers-Connection-System.git
cd Mentor-and-Researchers-Connection-System
git checkout adeesha-module
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd rag-backend
npm install
cd ..
```

### Environment Setup

1. **Frontend Environment** (create `.env` in root directory):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. **Backend Environment** (create `rag-backend/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
PORT=3003
NODE_ENV=development
```

### Running the Application

1. **Start the backend server:**
```bash
cd rag-backend
npm start
```
Backend will run on `http://localhost:3003`

2. **Start the frontend development server:**
```bash
npm run dev
```
Frontend will run on `http://localhost:3001` (or next available port)

3. **Open your browser:**
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:3003`

## 🔧 Firebase Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (Email/Password)

### 2. Configure Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{collection}/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Set up Firestore Indexes
Create composite indexes for:
- **Users**: `keywords` (Array), `userType` (String)
- **Posts**: `timestamp` (Descending), `authorId` (String)
- **Messages**: `timestamp` (Descending), `chatId` (String)
- **Chats**: `participants` (Array), `lastMessageTime` (Descending)
- **Notifications**: `recipientId` (String), `timestamp` (Descending)

## 🌐 CORS Configuration

The backend includes comprehensive CORS configuration for development and production:

```javascript
// CORS configuration in rag-backend/production-index-fallback.js
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

## 📊 API Endpoints

### Backend API (`http://localhost:3003`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/health` | GET | System health check | None |
| `/smart-match` | POST | AI-powered professor matching | JWT Required |
| `/auth/login` | POST | User authentication | None |
| `/auth/verify` | POST | Token verification | JWT Required |

### Request Examples

**Smart Matching:**
```bash
curl -X POST http://localhost:3003/smart-match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "researchInterests": "Machine Learning, AI, Data Science",
    "userType": "student"
  }'
```

**Health Check:**
```bash
curl http://localhost:3003/health
```

## 🎯 Key Features Explained

### AI-Powered Smart Matching
- **Gemini AI Integration**: Analyzes research interests using natural language processing
- **Intelligent Matching**: Finds professors based on research area compatibility
- **Detailed Justifications**: AI explains why each match is relevant
- **Similarity Scoring**: Provides match confidence percentages

### Real-Time Chat System
- **WhatsApp-like Interface**: Modern chat UI with sidebar and main chat area
- **Message Persistence**: Chat history maintained across sessions
- **Chat Management**: Pin, rename, and delete conversations
- **Real-time Notifications**: Instant message notifications with count badges
- **File Sharing**: Upload and share documents in chats

### Professional Profile System
- **Comprehensive Profiles**: Research areas, publications, skills, availability
- **Role-Based Access**: Different features for students, professors, and admins
- **Onboarding Flow**: Guided setup for new users
- **Profile Verification**: Professional status indicators

### Social Features
- **Global Feed**: Share research updates and discoveries
- **File Upload Support**: Share documents, images, and research materials
- **Social Interactions**: Like, comment, and engage with posts
- **Real-time Updates**: Live feed updates

## 🚀 Usage Guide

### For Students
1. **Complete Profile**: Set up your academic profile with research interests
2. **Find Collaborators**: Use smart matching to find relevant professors
3. **Start Conversations**: Message professors directly through the chat system
4. **Share Updates**: Post about your research progress on the global feed
5. **Manage Chats**: Pin important conversations, rename chats, and organize your messages

### For Professors
1. **Professional Profile**: Create detailed academic profiles
2. **Connect with Students**: Find students interested in your research
3. **Share Research**: Post about your latest discoveries
4. **Collaborate**: Engage with the academic community through real-time chat
5. **Manage Conversations**: Organize and prioritize student communications

### For Administrators
1. **Monitor Activity**: Use the admin dashboard for insights
2. **User Management**: Track platform usage and engagement
3. **System Health**: Monitor backend performance and user activity
4. **Analytics**: View comprehensive platform statistics

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm start            # Start RAG backend
npm run dev          # Start with auto-reload
npm test             # Run tests
```

### Database Cleanup
```bash
node cleanup-duplicate-chats.js  # Clean up duplicate chat documents
```

## 🛠️ Troubleshooting

### Common Issues

1. **Backend Not Running**
   - Ensure the RAG backend is started on port 3003
   - Check if port 3003 is available
   - Verify backend dependencies are installed

2. **Smart Matching Errors**
   - Check Gemini API key configuration
   - Verify API key has proper permissions
   - Check backend logs for detailed error messages

3. **Firebase Connection Issues**
   - Verify Firebase configuration in `.env`
   - Check Firestore security rules
   - Ensure authentication is enabled

4. **CORS Issues**
   - Backend includes proper CORS configuration
   - Check if frontend URL is in allowed origins
   - Verify credentials are properly set

5. **Chat Issues**
   - Check Firestore indexes are created
   - Verify user profiles are properly fetched
   - Check browser console for JavaScript errors

### Debug Steps

1. **Check Backend Health:**
```bash
curl http://localhost:3003/health
```

2. **Test Smart Matching:**
```bash
curl -X POST http://localhost:3003/smart-match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"researchInterests": "test", "userType": "student"}'
```

3. **Verify Firebase:**
   - Check browser console for authentication errors
   - Verify Firestore rules are properly configured
   - Check Firebase project settings

4. **Check Logs:**
   - Monitor backend terminal for error messages
   - Check browser console for frontend errors
   - Review Firestore security rules logs

## 🔐 Security Features

- **JWT Authentication**: Secure API access with token-based authentication
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Security Headers**: Helmet.js for comprehensive security
- **CORS Protection**: Proper cross-origin request handling
- **Input Validation**: Sanitized user inputs and queries
- **Firestore Security Rules**: Database-level security enforcement

## 📊 Performance

- **Real-time Updates**: Firestore for instant data synchronization
- **Optimized Queries**: Efficient database queries with proper indexing
- **Caching**: Smart caching for improved performance
- **Rate Limiting**: Balanced API usage for optimal performance
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and authentication
- [ ] Profile creation and editing
- [ ] Smart matching functionality
- [ ] Real-time chat messaging
- [ ] Chat management (pin, rename, delete)
- [ ] Notification system
- [ ] File upload and sharing
- [ ] Global feed posting
- [ ] Admin dashboard functionality
- [ ] Mobile responsiveness

### API Testing
```bash
# Test health endpoint
curl http://localhost:3003/health

# Test authentication
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (frontend and backend)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test all new features thoroughly
- Update documentation as needed
- Ensure CORS and security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review [Firebase documentation](https://firebase.google.com/docs)
3. Check [Gemini AI documentation](https://ai.google.dev/docs)
4. Review backend logs for error details
5. Open an issue in the repository

## 🎉 Recent Updates

- ✅ **Enhanced Chat System**: WhatsApp-like interface with real-time messaging
- ✅ **Chat Management**: Pin, rename, and delete chat conversations
- ✅ **Notification System**: Real-time notifications with count badges
- ✅ **User Profile Fixes**: Proper name display instead of IDs
- ✅ **AI-Powered Smart Matching** with Gemini AI
- ✅ **Professional Admin Dashboard** with analytics
- ✅ **Role-Based Access Control** for different user types
- ✅ **Global Academic Feed** with social features
- ✅ **Comprehensive Profile System** with onboarding
- ✅ **Security Enhancements** with JWT and rate limiting
- ✅ **Database Cleanup Tools** for maintenance
- ✅ **CORS Configuration** for cross-origin requests
- ✅ **Code Cleanup** - Removed all unused files and dependencies

## 🌟 Acknowledgments

- **Google Gemini AI** for intelligent matching capabilities
- **Firebase** for real-time database and authentication
- **React & Tailwind CSS** for modern UI development
- **Node.js & Express** for robust backend services

---

**Built with ❤️ for the academic community**

## 📞 Contact

- **GitHub**: [@Em-Deesha](https://github.com/Em-Deesha)
- **Repository**: [Mentor-and-Researchers-Connection-System](https://github.com/Em-Deesha/Mentor-and-Researchers-Connection-System)
- **Branch**: `adeesha-module` (Latest enhanced version)

---

*Last updated: January 2025*