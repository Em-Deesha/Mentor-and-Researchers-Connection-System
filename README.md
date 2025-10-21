# Academic Matchmaker

A comprehensive React-based academic networking platform that connects researchers and academics through **AI-powered smart matching**, real-time chat, collaborative feeds, and professional profile management.

## 🚀 Features

### Core Functionality
- **🤖 AI-Powered Smart Matching**: Gemini AI analyzes research interests and finds optimal collaborators
- **👤 Professional Profile Management**: Complete academic profiles with research areas, publications, and skills
- **💬 Real-time Chat**: Direct messaging between matched academics with file sharing
- **📰 Global Academic Feed**: Share research updates, discoveries, and collaborate on posts
- **🔐 Secure Authentication**: Firebase Authentication with role-based access control
- **📊 Admin Dashboard**: Comprehensive analytics and user management for administrators

### Advanced Features
- **🎯 Smart Matching Algorithm**: Uses Gemini AI to understand research interests and find relevant collaborators
- **📁 File Upload Support**: Share documents, images, and research materials
- **❤️ Social Features**: Like and comment on posts, engage with the academic community
- **🏷️ Role-Based Access**: Student, Professor, and Admin roles with different permissions
- **📈 Real-time Analytics**: Track user engagement and platform activity

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

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Firestore enabled
- Google Gemini API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd "MATCH MODULE"
   npm install
   cd rag-backend
   npm install
   ```

2. **Set up environment variables:**
   
   **Frontend** (create `.env` in root):
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   **Backend** (create `rag-backend/.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret
   PORT=3003
   ```

3. **Start the backend:**
   ```bash
   cd rag-backend
   npm start
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Frontend: `http://localhost:3004`
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

## 📁 Project Structure

```
MATCH MODULE/
├── src/
│   ├── App.jsx                    # Main application with all features
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Global styles and Tailwind
│   └── firebase-config.js         # Firebase configuration
├── rag-backend/
│   ├── production-index-fallback.js  # Main RAG backend
│   ├── firestore-integration.js      # Firestore data access
│   ├── package.json                  # Backend dependencies
│   └── production.env               # Backend environment
├── index.html                     # HTML template
├── package.json                   # Frontend dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # This file
```

## 🎯 Key Features Explained

### AI-Powered Smart Matching
- **Gemini AI Integration**: Analyzes research interests using natural language processing
- **Intelligent Matching**: Finds professors based on research area compatibility
- **Detailed Justifications**: AI explains why each match is relevant
- **Similarity Scoring**: Provides match confidence percentages

### Professional Profile System
- **Comprehensive Profiles**: Research areas, publications, skills, availability
- **Role-Based Access**: Different features for students, professors, and admins
- **Onboarding Flow**: Guided setup for new users
- **Profile Verification**: Professional status indicators

### Real-time Collaboration
- **Live Chat**: Instant messaging with file sharing
- **Global Feed**: Share research updates and discoveries
- **Social Features**: Like, comment, and engage with posts
- **File Uploads**: Share documents, images, and research materials

### Admin Dashboard
- **User Analytics**: Track total users, posts, and activity
- **Recent Activity**: Monitor new users and posts
- **System Statistics**: Platform health and usage metrics
- **User Management**: Oversee platform activity

## 🚀 Usage Guide

### For Students
1. **Complete Profile**: Set up your academic profile with research interests
2. **Find Collaborators**: Use smart matching to find relevant professors
3. **Start Conversations**: Message professors directly
4. **Share Updates**: Post about your research progress

### For Professors
1. **Professional Profile**: Create detailed academic profiles
2. **Connect with Students**: Find students interested in your research
3. **Share Research**: Post about your latest discoveries
4. **Collaborate**: Engage with the academic community

### For Administrators
1. **Monitor Activity**: Use the admin dashboard for insights
2. **User Management**: Track platform usage and engagement
3. **System Health**: Monitor backend performance and user activity

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm start` - Start RAG backend
- `npm run dev` - Start with auto-reload

### API Endpoints

**Backend API** (`http://localhost:3003`):
- `POST /smart-match` - AI-powered professor matching
- `POST /auth/login` - User authentication
- `GET /health` - System health check

## 🛠️ Troubleshooting

### Common Issues

1. **Backend Not Running**: Ensure the RAG backend is started on port 3003
2. **Smart Matching Errors**: Check Gemini API key configuration
3. **Firebase Connection**: Verify Firebase configuration and security rules
4. **CORS Issues**: Backend includes proper CORS configuration for localhost

### Debug Steps

1. **Check Backend Health**: `curl http://localhost:3003/health`
2. **Test Smart Matching**: Use the frontend or test with curl
3. **Verify Firebase**: Check browser console for authentication errors
4. **Check Logs**: Monitor backend terminal for error messages

## 🔐 Security Features

- **JWT Authentication**: Secure API access with token-based auth
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Security Headers**: Helmet.js for comprehensive security
- **CORS Protection**: Proper cross-origin request handling
- **Input Validation**: Sanitized user inputs and queries

## 📊 Performance

- **Real-time Updates**: Firestore for instant data synchronization
- **Optimized Queries**: Efficient database queries with proper indexing
- **Caching**: Smart caching for improved performance
- **Rate Limiting**: Balanced API usage for optimal performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (frontend and backend)
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase and Gemini AI documentation
3. Check backend logs for error details
4. Open an issue in the repository

## 🎉 Recent Updates

- ✅ **AI-Powered Smart Matching** with Gemini AI
- ✅ **Professional Admin Dashboard** with analytics
- ✅ **Role-Based Access Control** for different user types
- ✅ **Real-time Chat** with file sharing
- ✅ **Global Academic Feed** with social features
- ✅ **Comprehensive Profile System** with onboarding
- ✅ **Security Enhancements** with JWT and rate limiting
- ✅ **Code Cleanup** - Removed all unused files and dependencies

---

**Built with ❤️ for the academic community**