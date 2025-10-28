const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJhJhJhJhJhJhJhJhJhJhJhJhJhJhJhJh",
  authDomain: "academic-matchmaker-12345.firebaseapp.com",
  projectId: "academic-matchmaker-12345",
  storageBucket: "academic-matchmaker-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const appId = 'academic-matchmaker';

async function cleanupDuplicateChats() {
  try {
    console.log('🧹 Starting cleanup of duplicate chats...');
    
    // Get all chats
    const chatsRef = collection(db, `artifacts/${appId}/public/data/chats`);
    const chatsSnapshot = await getDocs(chatsRef);
    
    console.log(`📊 Found ${chatsSnapshot.docs.length} total chats`);
    
    const chatGroups = {};
    const duplicates = [];
    
    // Group chats by participants
    chatsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const participants = data.participants || [];
      
      if (participants.length === 2) {
        // Create a canonical key by sorting participants
        const sortedParticipants = participants.sort();
        const key = sortedParticipants.join('_');
        
        if (!chatGroups[key]) {
          chatGroups[key] = [];
        }
        chatGroups[key].push({
          id: doc.id,
          data: data,
          participants: sortedParticipants
        });
      }
    });
    
    // Find duplicates
    Object.entries(chatGroups).forEach(([key, chats]) => {
      if (chats.length > 1) {
        console.log(`🔄 Found ${chats.length} duplicate chats for participants: ${key}`);
        
        // Sort by creation time (keep the oldest)
        chats.sort((a, b) => {
          const timeA = a.data.createdAt?.toMillis() || 0;
          const timeB = b.data.createdAt?.toMillis() || 0;
          return timeA - timeB;
        });
        
        // Keep the first (oldest) chat, mark others for deletion
        const toKeep = chats[0];
        const toDelete = chats.slice(1);
        
        console.log(`✅ Keeping chat: ${toKeep.id}`);
        toDelete.forEach(chat => {
          console.log(`❌ Marking for deletion: ${chat.id}`);
          duplicates.push(chat.id);
        });
      }
    });
    
    console.log(`🗑️ Found ${duplicates.length} duplicate chats to delete`);
    
    // Delete duplicates
    for (const chatId of duplicates) {
      try {
        // Delete the chat document
        const chatRef = doc(db, `artifacts/${appId}/public/data/chats`, chatId);
        await deleteDoc(chatRef);
        console.log(`✅ Deleted duplicate chat: ${chatId}`);
      } catch (error) {
        console.error(`❌ Error deleting chat ${chatId}:`, error);
      }
    }
    
    console.log('🎉 Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupDuplicateChats();
