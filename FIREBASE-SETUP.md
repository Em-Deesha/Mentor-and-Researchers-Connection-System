# 🔥 Firebase Setup for Real Academic Matchmaker

## 📋 **Required Firebase Configuration**

To enable real conversations, posts, and data storage, you need to set up a Firebase project with the following services:

### 1. **Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `academic-matchmaker-prod`
4. Enable Google Analytics (optional)
5. Create the project

### 2. **Enable Authentication**

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Anonymous** authentication
5. Enable **Email/Password** authentication (optional)

### 3. **Set up Firestore Database**

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)

### 4. **Configure Firestore Security Rules**

Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. **Get Firebase Configuration**

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Add app** → **Web app** (</> icon)
4. Name it: `Academic Matchmaker Web`
5. Copy the configuration object

### 6. **Update Environment Variables**

Create a `.env` file in your project root with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_ID=academic-match-production
```

### 7. **Test Firebase Connection**

1. Start your React app: `npm run dev`
2. Check browser console for Firebase connection status
3. Try creating a profile in the "Edit Profile" tab
4. Test the chat functionality

## 🗂️ **Firestore Collections Structure**

The app will automatically create these collections:

```
artifacts/
└── academic-match-production/
    └── public/
        └── data/
            ├── users/           # User profiles
            ├── posts/           # Academic feed posts
            └── chats/           # Chat conversations
                └── {chatId}/
                    └── messages/ # Individual messages
```

## 🔐 **Authentication Flow**

1. **Anonymous Sign-in**: Users are automatically signed in anonymously
2. **Profile Creation**: Users create their academic profiles
3. **Real-time Chat**: Messages are stored in Firestore
4. **Posts Feed**: Academic posts are shared globally

## 📊 **Real-time Features**

- **Live Chat**: Messages appear instantly between users
- **Global Feed**: Posts appear in real-time for all users
- **Profile Updates**: Changes sync across all devices
- **Smart Matching**: RAG system works with real user data

## 🚀 **Production Deployment**

For production deployment:

1. **Update Security Rules** to be more restrictive
2. **Set up proper authentication** (email/password, Google, etc.)
3. **Configure CORS** for your domain
4. **Set up monitoring** and analytics
5. **Backup strategy** for Firestore data

## 🛠️ **Troubleshooting**

### Common Issues:

1. **"Firebase config is missing"**
   - Check your `.env` file exists
   - Verify all environment variables are set
   - Restart the development server

2. **"Permission denied"**
   - Check Firestore security rules
   - Ensure user is authenticated
   - Verify collection paths

3. **"Chat not loading"**
   - Check Firestore database is created
   - Verify authentication is working
   - Check browser console for errors

### Debug Steps:

1. Open browser DevTools
2. Check Console for Firebase errors
3. Check Network tab for failed requests
4. Verify Firebase project is active
5. Test with Firebase Console directly

## 📈 **Monitoring**

- **Firebase Console**: Monitor usage, errors, and performance
- **Firestore Usage**: Track read/write operations
- **Authentication**: Monitor user sign-ins
- **Real-time**: Check connection status

## 🎯 **Next Steps**

1. **Set up your Firebase project** following the steps above
2. **Update the environment variables** with your actual config
3. **Test the real-time features** (chat, posts, profiles)
4. **Deploy to production** when ready

The system will now store real conversations, posts, and user data in Firebase Firestore! 🚀
