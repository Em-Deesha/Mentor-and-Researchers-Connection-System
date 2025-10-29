# 🔥 Firebase Setup Guide

Complete guide to set up Firebase for the Academic Matchmaker application.

## 📋 Prerequisites

- Google account
- Node.js (v18 or higher)
- Firebase CLI (optional but recommended)

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Enter project name: `academic-matchmaker-prod` (or your preferred name)
   - Enable Google Analytics (optional)
   - Click "Create project"

3. **Project Configuration**
   - Wait for project creation to complete
   - Note your Project ID (you'll need this later)

## 🔐 Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In Firebase Console, click "Authentication" in the left sidebar
   - Click "Get started"

2. **Configure Sign-in Methods**
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider:
     - Click on "Email/Password"
     - Toggle "Enable" to ON
     - Click "Save"

3. **Optional: Configure Other Providers**
   - Google Sign-in (recommended)
   - GitHub Sign-in
   - Phone authentication

## 🗄️ Step 3: Set Up Firestore Database

1. **Create Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" for development
   - Click "Next"

3. **Choose Location**
   - Select a location close to your users
   - Recommended: `asia-south1` (Mumbai) or `us-central1`
   - Click "Done"

## 🔒 Step 4: Configure Security Rules

1. **Navigate to Firestore Rules**
   - Go to "Firestore Database" → "Rules" tab

2. **Update Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
       // Allow authenticated users to read/write their own data
       match /artifacts/{appId}/public/data/{collection}/{document} {
         allow read, write: if request.auth != null;
       }
       
       // Allow users to read public data
       match /artifacts/{appId}/public/data/{collection}/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Allow users to manage their own chats
       match /artifacts/{appId}/public/data/chats/{chatId} {
         allow read, write: if request.auth != null && 
           request.auth.uid in resource.data.participants;
       }
       
       // Allow users to manage their own messages
       match /artifacts/{appId}/public/data/chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
       
       // Allow users to manage their own notifications
       match /artifacts/{appId}/public/data/notifications/{notificationId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.recipientId;
       }
  }
}
```

3. **Publish Rules**
   - Click "Publish" to apply the rules

## 📊 Step 5: Create Firestore Indexes

1. **Navigate to Indexes**
   - Go to "Firestore Database" → "Indexes" tab

2. **Create Composite Indexes**
   
   **For Users Collection:**
   - Collection: `artifacts/{appId}/public/data/users`
   - Fields: `keywords` (Array), `userType` (String)
   - Query scope: Collection
   
   **For Posts Collection:**
   - Collection: `artifacts/{appId}/public/data/posts`
   - Fields: `timestamp` (Descending), `authorId` (String)
   - Query scope: Collection
   
   **For Messages Collection:**
   - Collection: `artifacts/{appId}/public/data/chats/{chatId}/messages`
   - Fields: `timestamp` (Descending), `chatId` (String)
   - Query scope: Collection
   
   **For Chats Collection:**
   - Collection: `artifacts/{appId}/public/data/chats`
   - Fields: `participants` (Array), `lastMessageTime` (Descending)
   - Query scope: Collection
   
   **For Notifications Collection:**
   - Collection: `artifacts/{appId}/public/data/notifications`
   - Fields: `recipientId` (String), `timestamp` (Descending)
   - Query scope: Collection

3. **Create Indexes**
   - Click "Create Index" for each required index
   - Wait for indexes to build (may take a few minutes)

## 🔑 Step 6: Get Firebase Configuration

1. **Navigate to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

2. **Get Web App Configuration**
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app icon (`</>`)
   - Enter app nickname: `academic-matchmaker-web`
   - Click "Register app"

3. **Copy Configuration**
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Update Your Environment Variables**
   - Create `.env` file in your project root:
```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## 🗂️ Step 7: Set Up Collections Structure

1. **Create Initial Collections**
   Your Firestore will have this structure:
```
artifacts/
   └── {appId}/
    └── public/
        └── data/
            ├── users/           # User profiles
               ├── professors/      # Professor profiles
               ├── students/        # Student profiles
               ├── posts/           # Global feed posts
               ├── chats/           # Chat conversations
               │   └── {chatId}/
               │       └── messages/  # Chat messages
               └── notifications/   # User notifications
   ```

2. **Sample Data Structure**
   
   **User Document:**
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "userType": "student",
     "keywords": ["AI", "Machine Learning"],
     "researchInterests": "Artificial Intelligence and Machine Learning",
     "createdAt": "timestamp",
     "updatedAt": "timestamp"
   }
   ```
   
   **Chat Document:**
   ```json
   {
     "participants": ["userId1", "userId2"],
     "lastMessage": "Hello!",
     "lastMessageTime": "timestamp",
     "lastMessageSender": "userId1",
     "isPinned": false,
     "createdAt": "timestamp"
   }
   ```
   
   **Message Document:**
   ```json
   {
     "senderId": "userId1",
     "text": "Hello!",
     "timestamp": "timestamp",
     "chatId": "chatId"
   }
   ```

## 🔧 Step 8: Firebase CLI Setup (Optional)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in Project**
   ```bash
   firebase init firestore
   ```

4. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🧪 Step 9: Test Firebase Connection

1. **Test Authentication**
   ```javascript
   import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
   
   const auth = getAuth();
   signInWithEmailAndPassword(auth, 'test@example.com', 'password')
     .then((userCredential) => {
       console.log('Authentication successful:', userCredential.user);
     })
     .catch((error) => {
       console.error('Authentication failed:', error);
     });
   ```

2. **Test Firestore Connection**
   ```javascript
   import { getFirestore, collection, getDocs } from 'firebase/firestore';
   
   const db = getFirestore();
   const testCollection = collection(db, 'test');
   getDocs(testCollection)
     .then((snapshot) => {
       console.log('Firestore connection successful');
     })
     .catch((error) => {
       console.error('Firestore connection failed:', error);
     });
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check if Email/Password provider is enabled
   - Verify API key is correct
   - Ensure domain is authorized

2. **Firestore Permission Denied**
   - Check security rules
   - Verify user is authenticated
   - Check collection/document paths

3. **Index Errors**
   - Create required composite indexes
   - Wait for indexes to build
   - Check query structure

4. **CORS Issues**
   - Add your domain to authorized domains
   - Check Firebase configuration
   - Verify API key permissions

### Debug Steps

1. **Check Firebase Console**
   - Monitor Authentication tab for user activity
   - Check Firestore for data operations
   - Review security rules logs

2. **Browser Console**
   - Check for Firebase SDK errors
   - Verify configuration loading
   - Monitor network requests

3. **Firebase CLI**
   ```bash
   firebase projects:list
   firebase use your-project-id
   firebase firestore:rules:get
   ```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

## 🔐 Security Best Practices

1. **Use Strong Security Rules**
   - Always validate user authentication
   - Implement proper data validation
   - Use field-level security

2. **Monitor Usage**
   - Set up billing alerts
   - Monitor API usage
   - Review security logs

3. **Regular Updates**
   - Keep Firebase SDK updated
   - Review and update security rules
   - Monitor for security advisories

## 📊 Monitoring & Analytics

1. **Enable Analytics**
   - Set up Firebase Analytics
   - Track user engagement
   - Monitor app performance

2. **Set Up Monitoring**
   - Configure error reporting
   - Set up performance monitoring
   - Monitor security events

---

**Next Steps:** After completing Firebase setup, proceed to [RAG-SETUP.md](./RAG-SETUP.md) for backend configuration.