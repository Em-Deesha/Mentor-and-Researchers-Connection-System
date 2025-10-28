import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot, addDoc, serverTimestamp, where, arrayUnion, getDocs, deleteDoc } from 'firebase/firestore';
import { User, GraduationCap, Globe, BookOpen, Send, Loader2, LogOut, CheckCheck, MessageSquare, Heart, Edit2, Clock, Search, Zap, XCircle, Bell, BellRing, Users, ArrowLeft } from 'lucide-react';

// --- Import Firebase Configuration ---
import { firebaseConfig, appId } from './firebase-config.js';

// --- Utility Functions ---

// Helper function to format Firestore Timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'Just now';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// --- Post Creator Component (Enhanced) ---
const PostCreator = ({ db, userId, userName, userTitle, onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [postType, setPostType] = useState('text'); // 'text', 'image', 'document'
  
  if (!db || !userId) return null;

  const postsCollection = collection(db, `artifacts/${appId}/public/data/posts`);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (postContent.trim() === '' && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      // Convert files to base64 for storage
      const fileData = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
        }))
      );

      await addDoc(postsCollection, {
        authorId: userId,
        authorName: userName || 'Anonymous Researcher',
        authorTitle: userTitle || 'Academic Member',
        content: postContent,
        files: fileData,
        postType: postType,
        timestamp: serverTimestamp(), 
        likes: 0,
        comments: [],
        isEdited: false,
      });
      
      setPostContent('');
      setSelectedFiles([]);
      setPostType('text');
      setMessage('Post published successfully!');
      onPostCreated();
    } catch (error) {
      console.error('Error adding post:', error);
      setMessage(`Error publishing post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
        <BookOpen className="w-5 h-5 mr-2" /> Share Your Research
      </h3>
      <form onSubmit={handleSubmit}>
        {/* Post Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="postType"
                value="text"
                checked={postType === 'text'}
                onChange={(e) => setPostType(e.target.value)}
                className="mr-2"
              />
              Text Post
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="postType"
                value="image"
                checked={postType === 'image'}
                onChange={(e) => setPostType(e.target.value)}
                className="mr-2"
              />
              Image/Media
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="postType"
                value="document"
                checked={postType === 'document'}
                onChange={(e) => setPostType(e.target.value)}
                className="mr-2"
              />
              Document
            </label>
          </div>
        </div>

        {/* Content Textarea */}
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          rows="3"
          placeholder="What new discovery or collaboration opportunity are you working on today?"
          className="w-full rounded-lg border border-gray-300 p-3 mb-3 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
          disabled={isSubmitting}
        />

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Attach Files</label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isSubmitting}
          />
          
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isSubmitting || (postContent.trim() === '' && selectedFiles.length === 0)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
            Publish Post
          </button>
          {message && <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
        </div>
      </form>
    </div>
  );
};

// --- Posts Feed Component (Enhanced) ---
const PostsFeed = ({ db, isAuthReady, userId }) => {
  const [posts, setPosts] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});

  const fetchPosts = useCallback(() => {
    if (!db || !isAuthReady) return;
    
    setIsLoadingFeed(true);
    const postsCollectionRef = collection(db, `artifacts/${appId}/public/data/posts`);
    const postsQuery = query(postsCollectionRef);
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Client-side sorting by timestamp (descending)
      fetchedPosts.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return b.timestamp.toMillis() - a.timestamp.toMillis();
      });
      
      setPosts(fetchedPosts);
      setIsLoadingFeed(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setIsLoadingFeed(false);
    });

    return unsubscribe;
  }, [db, isAuthReady]);

  useEffect(() => {
    return fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId, currentLikes) => {
    if (!db || !userId) return;
    
    try {
      const postRef = doc(db, `artifacts/${appId}/public/data/posts`, postId);
      await setDoc(postRef, {
        likes: currentLikes + 1,
        likedBy: arrayUnion(userId)
      }, { merge: true });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    if (!db || !userId || !newComments[postId]?.trim()) return;
    
    try {
      const postRef = doc(db, `artifacts/${appId}/public/data/posts`, postId);
      const newComment = {
        id: Date.now().toString(),
        authorId: userId,
        authorName: 'You', // This should be fetched from user profile
        text: newComments[postId],
        timestamp: serverTimestamp()
      };
      
      await setDoc(postRef, {
        comments: arrayUnion(newComment)
      }, { merge: true });
      
      setNewComments(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (!isAuthReady) {
    return <p className="text-center p-8 text-gray-500">Awaiting authentication...</p>;
  }

  if (isLoadingFeed) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mr-2" />
        <p className="text-gray-600">Loading academic feed...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-lg">No posts yet. Be the first to share an update!</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-3 border-b pb-3">
            <User className="w-8 h-8 p-1 rounded-full bg-indigo-100 text-indigo-600 mr-3" />
            <div>
              <p className="font-bold text-gray-900">{post.authorName}</p>
              <p className="text-sm text-gray-500">{post.authorTitle}</p>
            </div>
            <div className="ml-auto text-xs text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimestamp(post.timestamp)}
            </div>
          </div>
          
          {/* Post Content */}
          <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>
          
          {/* File Attachments */}
          {post.files && post.files.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Attachments:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {post.files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    {file.type.startsWith('image/') ? (
                      <div>
                        <img 
                          src={file.data} 
                          alt={file.name}
                          className="max-w-full h-48 object-cover rounded"
                        />
                        <p className="text-sm text-gray-600 mt-2">{file.name}</p>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center mr-3">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Post Type Badge */}
          {post.postType && post.postType !== 'text' && (
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {post.postType === 'image' ? '📷 Image Post' : '📄 Document Post'}
              </span>
            </div>
          )}
          
          {/* Like and Comment Buttons */}
          <div className="flex space-x-4 pt-3 border-t">
            <button 
              onClick={() => handleLike(post.id, post.likes || 0)}
              className="flex items-center text-indigo-600 hover:text-indigo-700 transition duration-150 text-sm font-medium"
            >
              <Heart className="w-4 h-4 mr-1" />
              Like ({post.likes || 0})
            </button>
            <button 
              onClick={() => toggleComments(post.id)}
              className="flex items-center text-gray-500 hover:text-gray-700 transition duration-150 text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Comment ({post.comments?.length || 0})
            </button>
          </div>
          
          {/* Comments Section */}
          {expandedComments[post.id] && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
              
              {/* Existing Comments */}
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {comment.timestamp ? formatTimestamp(comment.timestamp) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
              )}
              
              {/* Add Comment Form */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComments[post.id] || ''}
                  onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                  className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleComment(post.id)}
                  disabled={!newComments[post.id]?.trim()}
                  className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


// --- Chat Window Component (Real Firestore) ---
const ChatWindow = ({ db, currentUserId, partner, onEndChat, onSendNotification }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Helper to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Find or Create Chat Document (Real Firestore)
  useEffect(() => {
    if (!db || !currentUserId || !partner.userId) {
      console.log('🚫 ChatWindow: Missing required data:', { db: !!db, currentUserId, partnerUserId: partner?.userId });
      return;
    }

    console.log('🚀 ChatWindow: Starting chat setup for:', partner);
    setIsLoading(true);
    // Participants array is sorted alphabetically to create a canonical chat ID
    const participants = [currentUserId, partner.userId].sort();
    const chatId = participants.join('_');
    
    console.log('🔍 ChatWindow: Looking for chat with ID:', chatId);
    console.log('🔍 ChatWindow: Chat path:', `artifacts/${appId}/public/data/chats/${chatId}`);
    const chatRef = doc(db, `artifacts/${appId}/public/data/chats`, chatId);

    const unsubscribe = onSnapshot(chatRef, async (doc) => {
      if (doc.exists()) {
        console.log('✅ Found existing chat:', chatId);
        setChatId(chatId);
        setIsLoading(false);
      } else {
        // Chat does not exist, create it
        try {
          await setDoc(chatRef, {
          participants: participants,
          createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            lastMessageSender: ''
          });
          console.log('✅ Created new chat:', chatId);
          setChatId(chatId);
      setIsLoading(false);
        } catch (error) {
          console.error('Error creating chat:', error);
          setIsLoading(false);
        }
      }
    }, (error) => {
      console.error('Error fetching chat:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentUserId, partner.userId]);

  // 2. Listen for Messages (Real Firestore)
  useEffect(() => {
    if (!db || !chatId) {
      console.log('🚫 Messages: Missing required data:', { db: !!db, chatId });
      return;
    }

    console.log('📨 Messages: Listening for messages in chat:', chatId);
    const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/chats/${chatId}/messages`);
    console.log('📨 Messages collection path:', `artifacts/${appId}/public/data/chats/${chatId}/messages`);
    const messagesQuery = query(messagesCollectionRef); 

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      console.log('📨 Messages: Received snapshot with', snapshot.docs.length, 'messages');
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side sorting by timestamp
      fetchedMessages.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return a.timestamp.toMillis() - b.timestamp.toMillis();
      });

      console.log('📨 Messages: Processed messages:', fetchedMessages);
      setMessages(fetchedMessages);
      // Wait for messages to load, then scroll
      setTimeout(scrollToBottom, 100); 
    }, (error) => {
      console.error("📨 Messages: Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [db, chatId]);

  // 3. Send Message Handler (Real Firestore)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !chatId) {
      console.log('🚫 Cannot send message:', { newMessage: newMessage.trim(), chatId });
      return;
    }

    console.log('📤 Sending message:', {
      text: newMessage,
      senderId: currentUserId,
      chatId: chatId,
      partner: partner
    });

    const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/chats/${chatId}/messages`);
    console.log('📤 Messages collection path:', `artifacts/${appId}/public/data/chats/${chatId}/messages`);
    
    try {
      // Send the message
      const messageDoc = await addDoc(messagesCollectionRef, {
        senderId: currentUserId,
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      
      console.log('✅ Message sent successfully:', messageDoc.id);

      // Update chat with last message info
      const chatRef = doc(db, `artifacts/${appId}/public/data/chats`, chatId);
      await setDoc(chatRef, {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUserId
      }, { merge: true });

      // Create notification for the recipient
      if (onSendNotification && partner.userId) {
        // Get current user's name from profile data
        const currentUserName = profileData?.name || 'Someone';
        
        console.log('📨 Creating notification for:', {
          recipientId: partner.userId,
          senderId: currentUserId,
          senderName: currentUserName,
          message: newMessage
        });
        
        await onSendNotification({
          recipientId: partner.userId,
          senderId: currentUserId,
          senderName: currentUserName,
          type: 'message',
          title: 'New Message',
          message: `${currentUserName} sent you a message: "${newMessage}"`,
          chatId: chatId,
          timestamp: serverTimestamp()
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  if (isLoading || !chatId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-100 rounded-xl">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mr-2" />
        <p className="text-gray-600">Setting up chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b bg-indigo-50 rounded-t-xl flex items-center justify-between">
        <h3 className="font-bold text-lg text-indigo-700 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" /> Chatting with {partner.name}
        </h3>
        <button onClick={onEndChat} className="text-red-500 hover:text-red-700 transition">
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            console.log('📨 Rendering message:', msg);
            return (
          <div key={index} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-xl shadow-md text-sm ${
              msg.senderId === currentUserId 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-tl-none'
            }`}>
              <p>{msg.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp ? 
                      (msg.timestamp.toDate ? 
                        msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                        new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ) : 'Just now'}
              </span>
            </div>
          </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || newMessage.trim() === ''}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={async () => {
              console.log('🧪 Test button clicked');
              console.log('Current state:', { chatId, currentUserId, partner, messages: messages.length });
              console.log('Messages array:', messages);
              
              // Manually check messages in database
              if (chatId && db) {
                try {
                  const messagesRef = collection(db, `artifacts/${appId}/public/data/chats/${chatId}/messages`);
                  const snapshot = await getDocs(messagesRef);
                  console.log('🔍 Manual query result:', {
                    path: `artifacts/${appId}/public/data/chats/${chatId}/messages`,
                    docCount: snapshot.docs.length,
                    docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
                  });
                } catch (error) {
                  console.error('❌ Manual query error:', error);
                }
              }
            }}
            className="px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            title="Debug Info"
          >
            🧪
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Chat List Component ---
const ChatList = ({ db, currentUserId, onSelectChat, onBack }) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});
  const [profilesLoading, setProfilesLoading] = useState(false);

  // Fetch user profiles for chat participants
  useEffect(() => {
    if (!db || !currentUserId || chats.length === 0) return;

    const fetchUserProfiles = async (userIds) => {
      console.log('🔍 Fetching profiles for user IDs:', userIds);
      setProfilesLoading(true);
      const profiles = {};
      
      for (const userId of userIds) {
        if (userId === currentUserId) continue;
        
        try {
          // Try professors collection first
          const professorRef = doc(db, `artifacts/${appId}/public/data/professors`, userId);
          const professorSnap = await getDoc(professorRef);
          
          if (professorSnap.exists()) {
            const data = professorSnap.data();
            profiles[userId] = { ...data, userId, userType: 'professor' };
            console.log(`✅ Found professor profile for ${userId}:`, data.name);
            continue;
          }
          
          // Try students collection
          const studentRef = doc(db, `artifacts/${appId}/public/data/students`, userId);
          const studentSnap = await getDoc(studentRef);
          
          if (studentSnap.exists()) {
            const data = studentSnap.data();
            profiles[userId] = { ...data, userId, userType: 'student' };
            console.log(`✅ Found student profile for ${userId}:`, data.name);
            continue;
          }
          
          // Fallback to users collection
          const userRef = doc(db, `artifacts/${appId}/public/data/users`, userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            profiles[userId] = { ...data, userId };
            console.log(`✅ Found user profile for ${userId}:`, data.name);
          } else {
            console.log(`❌ No profile found for ${userId} in any collection`);
          }
        } catch (error) {
          console.error(`Error fetching profile for ${userId}:`, error);
        }
      }
      
      console.log('📊 Final profiles:', profiles);
      setUserProfiles(profiles);
      setProfilesLoading(false);
    };

    // Get all unique user IDs from chats
    const allUserIds = new Set();
    chats.forEach(chat => {
      console.log('📝 Chat participants:', chat.participants);
      chat.participants.forEach(participant => allUserIds.add(participant));
    });
    
    console.log('👥 All unique user IDs:', Array.from(allUserIds));
    
    if (allUserIds.size > 0) {
      fetchUserProfiles(Array.from(allUserIds));
    }
  }, [db, currentUserId, chats]);

  // Listen for user's chats
  useEffect(() => {
    if (!db || !currentUserId) return;

    setIsLoading(true);
    
    const chatsCollectionRef = collection(db, `artifacts/${appId}/public/data/chats`);
    const userChatsQuery = query(chatsCollectionRef, where('participants', 'array-contains', currentUserId));

    const unsubscribe = onSnapshot(userChatsQuery, (snapshot) => {
      const userChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('💬 Loaded chats:', userChats.length);
      userChats.forEach(chat => {
        console.log(`📝 Chat ${chat.id}:`, {
          participants: chat.participants,
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.lastMessageTime
        });
      });

      // Sort chats by last message timestamp
      userChats.sort((a, b) => {
        const aTime = a.lastMessageTime?.toMillis() || a.createdAt?.toMillis() || 0;
        const bTime = b.lastMessageTime?.toMillis() || b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      setChats(userChats);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching chats:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentUserId]);

  // Get the other participant in a chat
  const getOtherParticipant = (chat) => {
    return chat.participants.find(participant => participant !== currentUserId);
  };

  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = timestamp.toDate();
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  if (isLoading || profilesLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-100 rounded-xl">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mr-2" />
        <p className="text-gray-600">
          {isLoading ? 'Loading chats...' : 'Loading user profiles...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b bg-indigo-50 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 text-gray-600 hover:text-gray-800 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-lg text-indigo-700 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" /> Recent Chats
          </h3>
        </div>
        <div className="text-sm text-gray-600">
          {chats.length} conversation{chats.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm">Start a conversation from the Matchmaker tab</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chats
              .filter((chat) => {
                const otherUserId = getOtherParticipant(chat);
                return userProfiles[otherUserId]; // Only show chats where we have the user profile
              })
              .map((chat) => {
                const otherUserId = getOtherParticipant(chat);
                const otherUser = userProfiles[otherUserId];
                
                return (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(otherUser)}
                    className="w-full p-4 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">
                          {otherUser.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {otherUser.name || 'Unknown User'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            
            {/* Show message if all chats have unknown users */}
            {chats.length > 0 && chats.every((chat) => {
              const otherUserId = getOtherParticipant(chat);
              return !userProfiles[otherUserId];
            }) && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <User className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No valid conversations found</p>
                <p className="text-sm">User profiles may not be available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Notification Component ---
const NotificationCenter = ({ db, currentUserId, notifications, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!db || !notificationId) return;
    
    try {
      const notificationRef = doc(db, `artifacts/${appId}/public/data/notifications`, notificationId);
      await setDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!db || !currentUserId) return;
    
    setIsLoading(true);
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-indigo-50 rounded-t-xl flex items-center justify-between">
          <h3 className="font-bold text-lg text-indigo-700 flex items-center">
            <Bell className="w-5 h-5 mr-2" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isLoading}
                className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <Bell className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {notification.type === 'message' ? (
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Bell className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp?.toDate().toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Chats Manager Component ---
const ChatsManager = ({ db, userId, userName, userType, pendingConversation, onConversationStarted }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});

  // Handle pending conversation from Matchmaker
  useEffect(() => {
    if (pendingConversation && !activeChat) {
      console.log('🚀 Starting pending conversation with:', pendingConversation);
      setActiveChat(pendingConversation);
      // Don't clear pending conversation immediately - let it persist
      // onConversationStarted(); 
    }
  }, [pendingConversation, activeChat]);

  // Handle opening chat from notifications
  useEffect(() => {
    const handleOpenChatFromNotification = (event) => {
      const { partner } = event.detail;
      console.log('🔔 Opening chat from notification:', partner);
      console.log('🔔 Available chats:', chats);
      console.log('🔔 Available user profiles:', userProfiles);
      
      // Try to find the correct chat participant by matching the notification sender
      let correctParticipant = null;
      let matchingChat = null;
      
      // First, try to find by exact userId match
      for (const chat of chats) {
        const otherParticipant = getOtherParticipant(chat);
        if (otherParticipant === partner.userId) {
          const profile = userProfiles[otherParticipant];
          if (profile) {
            correctParticipant = profile;
            matchingChat = chat;
            console.log('✅ Found exact userId match:', profile);
            break;
          }
        }
      }
      
      // If not found, try to find by name match in existing chats
      if (!correctParticipant) {
        for (const chat of chats) {
          const otherParticipant = getOtherParticipant(chat);
          const profile = userProfiles[otherParticipant];
          
          if (profile && profile.name && partner.name) {
            const nameMatch = profile.name.toLowerCase().includes(partner.name.toLowerCase()) ||
                             partner.name.toLowerCase().includes(profile.name.toLowerCase());
            
            if (nameMatch) {
              correctParticipant = profile;
              matchingChat = chat;
              console.log('✅ Found name match:', profile);
              break;
            }
          }
        }
      }
      
      // If still not found, try to find by partial ID match
      if (!correctParticipant) {
        for (const chat of chats) {
          const otherParticipant = getOtherParticipant(chat);
          
          if (otherParticipant.includes(partner.userId) || partner.userId.includes(otherParticipant)) {
            const profile = userProfiles[otherParticipant];
            if (profile) {
              correctParticipant = profile;
              matchingChat = chat;
              console.log('✅ Found partial ID match:', profile);
              break;
            }
          }
        }
      }
      
      // If we found a matching chat, use the actual participant ID from that chat
      const chatPartner = correctParticipant ? {
        userId: getOtherParticipant(matchingChat), // Use the actual chat participant ID
        name: correctParticipant.name,
        userType: correctParticipant.userType || 'unknown'
      } : {
        userId: partner.userId,
        name: partner.name || partner.userId,
        userType: partner.userType || 'unknown'
      };
      
      console.log('🔔 Setting active chat with:', chatPartner);
      setActiveChat(chatPartner);
    };

    const handleMarkNotificationAsRead = (event) => {
      const { notificationId } = event.detail;
      console.log('📖 Marking notification as read:', notificationId);
      markNotificationAsRead(notificationId);
    };

    window.addEventListener('openChatFromNotification', handleOpenChatFromNotification);
    window.addEventListener('markNotificationAsRead', handleMarkNotificationAsRead);
    
    return () => {
      window.removeEventListener('openChatFromNotification', handleOpenChatFromNotification);
      window.removeEventListener('markNotificationAsRead', handleMarkNotificationAsRead);
    };
  }, [chats, userProfiles]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.chat-dropdown') && !event.target.closest('button[title="Chat options"]')) {
        document.querySelectorAll('.chat-dropdown').forEach(dropdown => {
          dropdown.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Listen for user's chats
  useEffect(() => {
    if (!db || !userId) return;

    console.log('🔍 Fetching chats for userId:', userId);
    setIsLoading(true);
    
    const chatsCollectionRef = collection(db, `artifacts/${appId}/public/data/chats`);
    
    // Try the array-contains query first, but also have a fallback
    const userChatsQuery = query(chatsCollectionRef, where('participants', 'array-contains', userId));
    
    // Fallback: get all chats and filter client-side
    const allChatsQuery = query(chatsCollectionRef);

    const unsubscribe = onSnapshot(userChatsQuery, (snapshot) => {
      console.log('📊 Primary query result:', snapshot.docs.length, 'docs');
      
      if (snapshot.docs.length === 0) {
        console.log('🔄 Primary query empty, trying fallback...');
        // Try fallback query
        const unsubscribeFallback = onSnapshot(allChatsQuery, (fallbackSnapshot) => {
          console.log('📊 Fallback query result:', fallbackSnapshot.docs.length, 'docs');
          const allChats = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Filter client-side
          const userChats = allChats.filter(chat => 
            chat.participants && chat.participants.includes(userId)
          );
          
          console.log('💬 Filtered chats:', userChats.length);
          console.log('💬 All chats:', allChats);
          console.log('💬 User chats:', userChats);
          
          processChats(userChats);
        });
        
        return () => unsubscribeFallback();
      } else {
        processChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => {
      console.error("Error fetching chats:", error);
      setIsLoading(false);
    });

    const processChats = (userChats) => {
      console.log('💬 Processing chats:', userChats.length);
      console.log('💬 Chat documents:', userChats);

      // Sort chats: pinned first, then by last message timestamp
      userChats.sort((a, b) => {
        // First, sort by pinned status
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // If both have same pinned status, sort by timestamp
        const aTime = a.lastMessageTime?.toMillis() || a.createdAt?.toMillis() || 0;
        const bTime = b.lastMessageTime?.toMillis() || b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      setChats(userChats);
      setIsLoading(false);
    };

    return () => unsubscribe();
  }, [db, userId]);

  // Fetch user profiles for chat participants
  useEffect(() => {
    if (!db || !userId || chats.length === 0) return;

    const fetchUserProfiles = async (userIds) => {
      console.log('🔍 Fetching profiles for user IDs:', userIds);
      const profiles = {};
      
      for (const participantId of userIds) {
        if (participantId === userId) continue;
        
        try {
          // Check if this is a Firebase UID (long random string) or custom ID
          const isFirebaseUID = participantId.length > 20 && /^[a-zA-Z0-9]+$/.test(participantId);
          
          if (isFirebaseUID) {
            // For Firebase UIDs, check all collections
            let found = false;
            
            // Try users collection first
            const userRef = doc(db, `artifacts/${appId}/public/data/users`, participantId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const data = userSnap.data();
              profiles[participantId] = { ...data, userId: participantId };
              console.log(`✅ Found Firebase user profile in users collection for ${participantId}:`, data.name);
              found = true;
            }
            
            // If not found in users, try professors collection
            if (!found) {
              const professorRef = doc(db, `artifacts/${appId}/public/data/professors`, participantId);
              const professorSnap = await getDoc(professorRef);
              
              if (professorSnap.exists()) {
                const data = professorSnap.data();
                profiles[participantId] = { ...data, userId: participantId, userType: 'professor' };
                console.log(`✅ Found Firebase user profile in professors collection for ${participantId}:`, data.name);
                found = true;
              }
            }
            
            // If still not found, try students collection
            if (!found) {
              const studentRef = doc(db, `artifacts/${appId}/public/data/students`, participantId);
              const studentSnap = await getDoc(studentRef);
              
              if (studentSnap.exists()) {
                const data = studentSnap.data();
                profiles[participantId] = { ...data, userId: participantId, userType: 'student' };
                console.log(`✅ Found Firebase user profile in students collection for ${participantId}:`, data.name);
                found = true;
              }
            }
            
            if (found) continue;
          } else {
              // For custom IDs, try direct lookup first
              // Try professors collection first
              const professorRef = doc(db, `artifacts/${appId}/public/data/professors`, participantId);
              const professorSnap = await getDoc(professorRef);
              
              if (professorSnap.exists()) {
                const data = professorSnap.data();
                profiles[participantId] = { ...data, userId: participantId, userType: 'professor' };
                console.log(`✅ Found professor profile for ${participantId}:`, data.name);
                continue;
              }
              
              // Try students collection
              const studentRef = doc(db, `artifacts/${appId}/public/data/students`, participantId);
              const studentSnap = await getDoc(studentRef);
              
              if (studentSnap.exists()) {
                const data = studentSnap.data();
                profiles[participantId] = { ...data, userId: participantId, userType: 'student' };
                console.log(`✅ Found student profile for ${participantId}:`, data.name);
                continue;
              }
              
              // If direct lookup fails, search all collections for partial matches
              console.log(`🔍 Direct lookup failed for ${participantId}, searching all collections...`);
              
              // Search in professors collection
              const professorsQuery = query(collection(db, `artifacts/${appId}/public/data/professors`));
              const professorsSnapshot = await getDocs(professorsQuery);
              
              console.log(`🔍 Searching ${professorsSnapshot.docs.length} professors for ${participantId}`);
              
              for (const doc of professorsSnapshot.docs) {
                const data = doc.data();
                console.log(`🔍 Checking professor ${doc.id}: name="${data.name}", customId="${data.customId}", userId="${data.userId}"`);
                
                // Check multiple matching criteria
                const nameMatch = data.name && data.name.toLowerCase().includes(participantId.toLowerCase());
                const customIdMatch = data.customId === participantId;
                const userIdMatch = data.userId === participantId;
                const reverseMatch = participantId.toLowerCase().includes(data.name?.toLowerCase() || '');
                
                if (nameMatch || customIdMatch || userIdMatch || reverseMatch) {
                  profiles[participantId] = { ...data, userId: doc.id, userType: 'professor' };
                  console.log(`✅ Found professor profile by search for ${participantId}:`, data.name);
                  break;
                }
              }
              
              if (profiles[participantId]) continue;
              
              // Search in students collection
              const studentsQuery = query(collection(db, `artifacts/${appId}/public/data/students`));
              const studentsSnapshot = await getDocs(studentsQuery);
              
              console.log(`🔍 Searching ${studentsSnapshot.docs.length} students for ${participantId}`);
              
              for (const doc of studentsSnapshot.docs) {
                const data = doc.data();
                console.log(`🔍 Checking student ${doc.id}: name="${data.name}", customId="${data.customId}", userId="${data.userId}"`);
                
                // Check multiple matching criteria
                const nameMatch = data.name && data.name.toLowerCase().includes(participantId.toLowerCase());
                const customIdMatch = data.customId === participantId;
                const userIdMatch = data.userId === participantId;
                const reverseMatch = participantId.toLowerCase().includes(data.name?.toLowerCase() || '');
                
                if (nameMatch || customIdMatch || userIdMatch || reverseMatch) {
                  profiles[participantId] = { ...data, userId: doc.id, userType: 'student' };
                  console.log(`✅ Found student profile by search for ${participantId}:`, data.name);
                  break;
                }
              }
            }
          
          console.log(`❌ No profile found for ${participantId} in any collection`);
        } catch (error) {
          console.error(`Error fetching profile for ${participantId}:`, error);
        }
      }
      
      console.log('📊 Final profiles:', profiles);
      setUserProfiles(profiles);
    };

    // Get all unique user IDs from chats
    const allUserIds = new Set();
    chats.forEach(chat => {
      chat.participants.forEach(participant => allUserIds.add(participant));
    });
    
    if (allUserIds.size > 0) {
      fetchUserProfiles(Array.from(allUserIds));
    }
  }, [db, userId, chats]);

  // Listen for notifications
  useEffect(() => {
    if (!db || !userId) return;

    const notificationsCollectionRef = collection(db, `artifacts/${appId}/public/data/notifications`);
    const userNotificationsQuery = query(notificationsCollectionRef, where('recipientId', '==', userId));

    const unsubscribe = onSnapshot(userNotificationsQuery, (snapshot) => {
      const userNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by timestamp (newest first)
      userNotifications.sort((a, b) => {
        const aTime = a.timestamp?.toMillis() || 0;
        const bTime = b.timestamp?.toMillis() || 0;
        return bTime - aTime;
      });

      setNotifications(userNotifications);
      
      // Count unread notifications
      const unreadCount = userNotifications.filter(n => !n.isRead).length;
      setUnreadNotificationCount(unreadCount);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    return () => unsubscribe();
  }, [db, userId]);

  // Send notification function
  const sendNotification = async (notificationData) => {
    if (!db) return;
    
    try {
      console.log('🔔 Sending notification:', notificationData);
      const notificationsCollectionRef = collection(db, `artifacts/${appId}/public/data/notifications`);
      const docRef = await addDoc(notificationsCollectionRef, {
        ...notificationData,
        isRead: false,
        createdAt: serverTimestamp()
      });
      console.log('✅ Notification sent successfully:', docRef.id);
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!db || !notificationId) return;
    
    try {
      console.log('📖 Marking notification as read:', notificationId);
      const notificationRef = doc(db, `artifacts/${appId}/public/data/notifications`, notificationId);
      await setDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Test notification function
  const testNotification = async () => {
    await sendNotification({
      recipientId: userId,
      senderId: 'test-sender',
      senderName: 'Test User',
      type: 'message',
      title: 'Test Notification',
      message: 'This is a test notification',
      timestamp: serverTimestamp()
    });
  };

  // Delete chat function
  const deleteChat = async (chatId) => {
    if (!db) return;
    
    try {
      // Delete the chat document
      const chatRef = doc(db, `artifacts/${appId}/public/data/chats`, chatId);
      await deleteDoc(chatRef);
      
      // Also delete all messages in the chat
      const messagesRef = collection(db, `artifacts/${appId}/public/data/chats/${chatId}/messages`);
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, `artifacts/${appId}/public/data/chats/${chatId}/messages`, messageDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      console.log('✅ Chat deleted successfully:', chatId);
      
      // If this was the active chat, clear it
      if (activeChat && chats.find(chat => chat.id === chatId)) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  // Get the other participant in a chat
  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
      console.log('⚠️ Invalid chat data:', chat);
      return null;
    }
    
    const otherParticipant = chat.participants.find(participant => participant !== userId);
    console.log('🔍 getOtherParticipant:', { 
      chatId: chat.id, 
      participants: chat.participants, 
      userId, 
      otherParticipant 
    });
    
    return otherParticipant || null;
  };

  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = timestamp.toDate();
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  // WhatsApp-like interface
  return (
    <div className="h-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 flex">
      {/* Left Sidebar - Recent Chats */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-indigo-50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-indigo-700 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" /> Chats
            </h3>
            <button
              onClick={() => {
                // Show notifications modal
                const notificationModal = document.createElement('div');
                notificationModal.innerHTML = `
                  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="if(event.target === this) this.remove()">
                    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[600px] flex flex-col" onclick="event.stopPropagation()">
                      <div class="p-4 border-b bg-indigo-50 rounded-t-xl flex items-center justify-between">
                        <h3 class="font-bold text-lg text-indigo-700 flex items-center">
                          <Bell class="w-5 h-5 mr-2" /> Notifications
                          ${unreadNotificationCount > 0 ? `<span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">${unreadNotificationCount}</span>` : ''}
                        </h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                          <XCircle class="w-5 h-5" />
                        </button>
                      </div>
                      <div class="flex-1 overflow-y-auto p-4">
                        ${notifications.length === 0 ? 
                          '<div class="flex flex-col items-center justify-center h-full text-gray-500 p-8"><Bell class="w-12 h-12 mb-4 text-gray-300" /><p class="text-lg font-medium">No notifications</p><p class="text-sm">You\'re all caught up!</p></div>' :
                          notifications.map(n => `
                            <div class="p-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer ${!n.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}" onclick="
                              // Find the sender's profile and open chat
                              const senderId = '${n.senderId}';
                              const senderName = '${n.senderName}';
                              const notificationId = '${n.id}';
                              const partner = { userId: senderId, name: senderName };
                              console.log('🔔 Notification clicked - dispatching event with partner:', partner);
                              
                              // Mark notification as read
                              window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
                                detail: { notificationId: notificationId } 
                              }));
                              
                              // Remove this notification from the UI immediately
                              this.style.opacity = '0';
                              this.style.transform = 'translateX(100%)';
                              setTimeout(() => {
                                this.remove();
                              }, 300);
                              
                              // Close modal after a short delay
                              setTimeout(() => {
                                this.closest('.fixed').remove();
                              }, 350);
                              
                              // Trigger chat opening (this will be handled by the parent component)
                              window.dispatchEvent(new CustomEvent('openChatFromNotification', { 
                                detail: { partner: partner } 
                              }));
                            ">
                              <div class="flex items-start">
                                <div class="flex-shrink-0">
                                  ${n.type === 'message' ? '<MessageSquare class="w-5 h-5 text-blue-500" />' : '<Bell class="w-5 h-5 text-gray-400" />'}
                                </div>
                                <div class="ml-3 flex-1 min-w-0">
                                  <p class="text-sm font-medium text-gray-900">${n.title}</p>
                                  <p class="text-sm text-gray-500 mt-1">${n.message}</p>
                                  <p class="text-xs text-gray-400 mt-1">${n.timestamp?.toDate().toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          `).join('')
                        }
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(notificationModal);
              }}
              className="relative flex items-center px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition duration-150"
            >
              <Bell className="w-4 h-4 mr-1" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 py-0.5 min-w-[16px] text-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mr-2" />
              <p className="text-gray-600">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No conversations yet</p>
              <p className="text-sm">Start a conversation from the Matchmaker tab</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {chats
                .map((chat) => {
                  const otherUserId = getOtherParticipant(chat);
                  
                  // Skip if we can't determine the other participant
                  if (!otherUserId) {
                    console.log('⚠️ Skipping chat with undefined otherUserId:', chat);
                    return null;
                  }
                  
                  const otherUser = userProfiles[otherUserId];
                  const isActive = activeChat?.userId === otherUserId;
                  
                  // If we don't have the user profile, create a fallback
                  const displayUser = otherUser || {
                    userId: otherUserId,
                    name: otherUserId && otherUserId.includes('_') ? otherUserId.split('_')[0] : otherUserId || 'Unknown User',
                    userType: 'unknown'
                  };
                  
                  return (
                    <div key={chat.id} className="relative group">
                      <button
                        onClick={() => {
                          console.log('🖱️ Chat clicked:', displayUser);
                          setActiveChat(displayUser);
                        }}
                        className={`w-full p-4 hover:bg-gray-50 transition text-left ${
                          isActive ? 'bg-indigo-50 border-r-4 border-r-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-indigo-600">
                              {displayUser.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <p className="font-medium text-gray-900 truncate">
                                  {displayUser.name || 'Unknown User'}
                                </p>
                                {chat.isPinned && (
                                  <svg className="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatLastMessageTime(chat.lastMessageTime)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-500 truncate">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                              {chat.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {/* 3-dots menu - appears on hover */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Close all other dropdowns first
                              document.querySelectorAll('.chat-dropdown').forEach(dropdown => {
                                dropdown.classList.add('hidden');
                              });
                              // Toggle current dropdown
                              const dropdown = e.currentTarget.parentElement.querySelector('.chat-dropdown');
                              dropdown.classList.toggle('hidden');
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-1"
                            title="Chat options"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown menu */}
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden chat-dropdown">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle pin status
                                  const chatRef = doc(db, `artifacts/${appId}/public/data/chats`, chat.id);
                                  const isPinned = chat.isPinned || false;
                                  
                                  setDoc(chatRef, {
                                    isPinned: !isPinned,
                                    pinnedAt: !isPinned ? serverTimestamp() : null
                                  }, { merge: true }).then(() => {
                                    console.log(`✅ Chat ${!isPinned ? 'pinned' : 'unpinned'}:`, chat.id);
                                  }).catch((error) => {
                                    console.error('❌ Error pinning/unpinning chat:', error);
                                  });
                                  
                                  e.target.closest('.relative').querySelector('.chat-dropdown').classList.add('hidden');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                {chat.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newName = prompt(`Rename chat with ${displayUser.name || 'Unknown User'}:`, displayUser.name || 'Unknown User');
                                  if (newName && newName.trim() !== '') {
                                    // TODO: Implement rename functionality
                                    console.log('Rename chat:', chat.id, 'to:', newName);
                                  }
                                  e.target.closest('.relative').querySelector('.chat-dropdown').classList.add('hidden');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Rename Chat
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Are you sure you want to delete this chat with ${displayUser.name || 'Unknown User'}?`)) {
                                    deleteChat(chat.id);
                                  }
                                  e.target.closest('.relative').querySelector('.chat-dropdown').classList.add('hidden');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-3" />
                                Delete Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                .filter(chat => chat !== null)}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Active Chat */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatWindow 
            db={db}
            currentUserId={userId}
            partner={activeChat}
            onEndChat={() => setActiveChat(null)}
            onSendNotification={sendNotification}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Matchmaker Component ---
const Matchmaker = ({ db, userId, userName, userType, onStartConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // Production RAG Smart Search Handler with Authentication
  const handleSearch = async (e) => {
    e.preventDefault();
    
    setError('');
    setIsSearching(true);
    setSearchResults([]);

    const term = searchQuery.trim();
    if (term.length < 3) {
      setError('Please enter at least 3 characters to search.');
      setIsSearching(false);
      return;
    }

    try {
      console.log(`🔍 Sending production RAG query: "${term}" for user type: ${userType}`);
      
      // Determine which endpoint to call based on user type
      let endpoint;
      if (userType === 'professor') {
        // Professors should see students
        endpoint = 'http://localhost:3003/smart-match-students';
        console.log('🎓 Professor searching for students');
      } else if (userType === 'student') {
        // Students should see professors
        endpoint = 'http://localhost:3003/smart-match-public';
        console.log('👨‍🏫 Student searching for professors');
      } else {
        // Default to professors for unknown user types
        endpoint = 'http://localhost:3003/smart-match-public';
        console.log('❓ Unknown user type, defaulting to professor search');
      }
      
      // Call production RAG backend API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: term })
      });

      if (!response.ok) {
        throw new Error(`Production RAG API error: ${response.status} ${response.statusText}`);
      }

      const results = await response.json();
      console.log('📊 Production RAG results with Gemini:', results);
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setError(`No smart matches found for "${term}". Try different research interests or keywords.`);
      }

    } catch (err) {
      console.error("Error in production RAG smart matching:", err);
      setError(`Production smart matching error: ${err.message}. Make sure the production RAG backend is running on port 3003.`);
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-indigo-700 flex items-center">
          <Zap className="w-6 h-6 mr-2" /> Academic Matchmaker
        </h3>
        </div>
        <p className="text-gray-600 mb-4">
          {userType === 'professor' 
            ? "Find talented students using AI-powered smart matching. Describe what kind of students you're looking for (e.g., 'machine learning students interested in healthcare' or 'PhD students working on cancer research')."
            : "Find collaborators using AI-powered smart matching. Describe your research interests naturally (e.g., 'I'm interested in quantum machine learning applications' or 'I work on CRISPR gene editing for cancer therapy')."
          }
        </p>
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={userType === 'professor' 
              ? "Describe what kind of students you're looking for (e.g., 'machine learning students interested in healthcare')..."
              : "Describe your research interests (e.g., 'quantum machine learning for drug discovery')..."
            }
            className="flex-1 rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || searchQuery.length < 3}
            className="flex items-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Search className="w-5 h-5 mr-2" />}
            Search
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {/* Smart Search Results */}
      <div className="space-y-4">
        {searchResults.map((match, index) => (
          <div key={match.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xl text-gray-900">{match.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                      Match #{index + 1}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {Math.round(match.similarityScore * 100)}% Match
                    </span>
                  </div>
                </div>
                <p className="text-md text-indigo-600 mb-2">{match.title} at {match.university}</p>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>{userType === 'professor' ? 'Student Research Area:' : 'Research Area:'}</strong> {match.researchArea}
                </p>
                
                {/* Smart Justification */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Why This Match?
                  </h4>
                  <p className="text-blue-800 text-sm leading-relaxed">{match.justification}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => onStartConversation && onStartConversation({ userId: match.id, name: match.name })}
                className="flex items-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-150 shadow-md transform hover:scale-[1.05]"
              >
                <MessageSquare className="w-5 h-5 mr-2" /> Start Conversation
              </button>
            </div>
          </div>
        ))}
        {searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && !error && (
            <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-lg">
              <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No smart matches found for your research interests.</p>
              <p className="text-sm mt-2">Try different keywords or research areas.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const ProfessorManagement = ({ db, userId, userType }) => {
  const [professors, setProfessors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [newProfessor, setNewProfessor] = useState({
    name: '',
    title: '',
    university: '',
    researchArea: '',
    email: '',
    website: '',
    department: '',
    lab: '',
    bio: '',
    keywords: '',
    availability: 'Available for collaborations'
  });

  // Load professors from Firestore
  useEffect(() => {
    if (!db) return;
    
    const professorsCollection = collection(db, `artifacts/${appId}/public/data/professors`);
    const unsubscribe = onSnapshot(professorsCollection, (snapshot) => {
      const fetchedProfessors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfessors(fetchedProfessors);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleAddProfessor = async (e) => {
    e.preventDefault();
    if (!db) return;

    try {
      const professorData = {
        ...newProfessor,
        keywords: typeof newProfessor.keywords === 'string' 
          ? newProfessor.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0)
          : Array.isArray(newProfessor.keywords) 
            ? newProfessor.keywords.map(k => k.trim().toLowerCase()).filter(k => k.length > 0)
            : [],
        createdAt: serverTimestamp(),
        addedBy: userId,
        isActive: true
      };

      await addDoc(collection(db, `artifacts/${appId}/public/data/professors`), professorData);
      setNewProfessor({
        name: '',
        title: '',
        university: '',
        researchArea: '',
        email: '',
        website: '',
        department: '',
        lab: '',
        bio: '',
        keywords: '',
        availability: 'Available for collaborations'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding professor:', error);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async () => {
    if (!db || csvData.length === 0) return;

    try {
      for (const professor of csvData) {
        const professorData = {
          name: professor.name || '',
          title: professor.title || '',
          university: professor.university || '',
          researchArea: professor.researchArea || '',
          email: professor.email || '',
          website: professor.website || '',
          department: professor.department || '',
          lab: professor.lab || '',
          bio: professor.bio || '',
          keywords: professor.keywords 
            ? (typeof professor.keywords === 'string' 
                ? professor.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0)
                : Array.isArray(professor.keywords) 
                  ? professor.keywords.map(k => k.trim().toLowerCase()).filter(k => k.length > 0)
                  : [])
            : [],
          availability: professor.availability || 'Available for collaborations',
          createdAt: serverTimestamp(),
          addedBy: userId,
          isActive: true
        };

        await addDoc(collection(db, `artifacts/${appId}/public/data/professors`), professorData);
      }
      setCsvData([]);
      setCsvFile(null);
    } catch (error) {
      console.error('Error importing CSV:', error);
    }
  };


  if (userType !== 'professor' && userType !== 'admin') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Professor Management</h3>
        <p className="text-gray-600">Only professors and admins can manage professor data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-indigo-700">Professor Management</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Add Professor
            </button>
            <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Add Professor Form */}
        {showAddForm && (
          <form onSubmit={handleAddProfessor} className="mb-6 p-4 border rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Add New Professor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newProfessor.name}
                onChange={(e) => setNewProfessor({...newProfessor, name: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Title/Position"
                value={newProfessor.title}
                onChange={(e) => setNewProfessor({...newProfessor, title: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="University"
                value={newProfessor.university}
                onChange={(e) => setNewProfessor({...newProfessor, university: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Research Area"
                value={newProfessor.researchArea}
                onChange={(e) => setNewProfessor({...newProfessor, researchArea: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newProfessor.email}
                onChange={(e) => setNewProfessor({...newProfessor, email: e.target.value})}
                className="p-2 border rounded"
              />
              <input
                type="url"
                placeholder="Website"
                value={newProfessor.website}
                onChange={(e) => setNewProfessor({...newProfessor, website: e.target.value})}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Department"
                value={newProfessor.department}
                onChange={(e) => setNewProfessor({...newProfessor, department: e.target.value})}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Lab/Research Group"
                value={newProfessor.lab}
                onChange={(e) => setNewProfessor({...newProfessor, lab: e.target.value})}
                className="p-2 border rounded"
              />
              <textarea
                placeholder="Bio/Description"
                value={newProfessor.bio}
                onChange={(e) => setNewProfessor({...newProfessor, bio: e.target.value})}
                className="p-2 border rounded md:col-span-2"
                rows="3"
              />
              <input
                type="text"
                placeholder="Keywords (comma-separated)"
                value={newProfessor.keywords}
                onChange={(e) => setNewProfessor({...newProfessor, keywords: e.target.value})}
                className="p-2 border rounded md:col-span-2"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Add Professor
              </button>
            </div>
          </form>
        )}

        {/* CSV Import */}
        {csvData.length > 0 && (
          <div className="mb-6 p-4 border rounded-lg bg-green-50">
            <h4 className="text-lg font-semibold mb-2">CSV Import Preview ({csvData.length} professors)</h4>
            <div className="max-h-40 overflow-y-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">University</th>
                    <th className="p-2 text-left">Research Area</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((prof, index) => (
                    <tr key={index}>
                      <td className="p-2">{prof.name}</td>
                      <td className="p-2">{prof.university}</td>
                      <td className="p-2">{prof.researchArea}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && <p className="text-sm text-gray-500">... and {csvData.length - 5} more</p>}
            </div>
            <button
              onClick={handleCsvImport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Import All Professors
            </button>
          </div>
        )}

        {/* Professors List */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Current Professors ({professors.length})</h4>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mr-2" />
              <p className="text-gray-600">Loading professors...</p>
            </div>
          ) : professors.length === 0 ? (
            <p className="text-center p-8 text-gray-500">No professors found. Add some professors to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professors.map(professor => (
                <div key={professor.id} className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold text-lg">{professor.name}</h5>
                  <p className="text-indigo-600 text-sm">{professor.title}</p>
                  <p className="text-gray-600 text-sm">{professor.university}</p>
                  <p className="text-gray-700 text-sm mt-2">{professor.researchArea}</p>
                  {professor.email && (
                    <p className="text-xs text-gray-500 mt-1">{professor.email}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {professor.keywords?.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                    {professor.keywords?.length > 3 && (
                      <span className="text-xs text-gray-500">+{professor.keywords.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Admin Dashboard Component ---
const AdminDashboard = ({ db, userId }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalMatches: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    if (!db) return;

    // Fetch user statistics
    const usersCollection = collection(db, `artifacts/${appId}/public/data/users`);
    const postsCollection = collection(db, `artifacts/${appId}/public/data/posts`);

    const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentUsers(users.slice(-5)); // Last 5 users
      setStats(prev => ({ ...prev, totalUsers: users.length }));
    });

    const unsubscribePosts = onSnapshot(postsCollection, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentPosts(posts.slice(-5)); // Last 5 posts
      setStats(prev => ({ ...prev, totalPosts: posts.length }));
    });

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
    };
  }, [db]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6 flex items-center">
          <User className="w-8 h-8 mr-3" />
          Admin Dashboard
        </h2>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
                <p className="text-blue-600">Total Users</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.totalPosts}</p>
                <p className="text-green-600">Total Posts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-700">{stats.totalMatches}</p>
                <p className="text-purple-600">Smart Matches</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-orange-700">{stats.activeUsers}</p>
                <p className="text-orange-600">Active Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{user.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{user.userType || 'Unknown'}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {user.createdAt ? formatTimestamp(user.createdAt) : 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Posts</h3>
            <div className="space-y-3">
              {recentPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{post.authorName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{post.content}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(post.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
// Chat Assistant Component
const ChatAssistant = ({ userType, profileData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! I can help you explore this ${userType} profile. What would you like to know?`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const suggestedQuestions = userType === 'professor' 
    ? [
        "Summarize this professor's research interests",
        "List top publications",
        "What are the main research areas?",
        "Tell me about supervised students",
        "What projects are they working on?"
      ]
    : [
        "Summarize this student's profile",
        "What skills does this student have?",
        "Tell me about their projects",
        "What are their achievements?",
        "Suggest collaboration opportunities"
      ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simulate bot response (placeholder for future AI integration)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: "🤖 This is a placeholder response. AI integration will be added in the next phase to provide intelligent profile analysis and suggestions.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Chat Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Profile Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-indigo-500 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Questions */}
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="space-y-1">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded text-gray-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about this profile..."
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard tab
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userType, setUserType] = useState(''); // 'student' or 'professor'
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [pendingConversation, setPendingConversation] = useState(null); // Track conversation to start

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    university: '',
    researchArea: '',
    keywords: '',
    bio: '',
    yearsExperience: 0,
    isVerified: false,
    userType: '', // 'student' or 'professor'
    department: '',
    degree: '', // For students
    advisor: '', // For students
    lab: '', // For professors
    publications: [], // For professors
    courses: [], // For professors
    interests: [], // For students
    skills: [], // For students
    gpa: '', // For students
    graduationYear: '', // For students
    funding: '', // For professors
    availability: '', // For professors
    timezone: '',
    languages: [],
    socialLinks: {
      linkedin: '',
      github: '',
      website: '',
      orcid: ''
    }
  });

  // 1. FIREBASE INITIALIZATION (Without Auto-Auth)
  useEffect(() => {
    if (!firebaseConfig.apiKey) {
      setMessage('Error: Firebase config is missing. Cannot initialize database.');
      setLoading(false);
      return;
    }

    const initFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const newAuth = getAuth(app);
        const newDb = getFirestore(app);

        setAuth(newAuth);
        setDb(newDb);

        const unsubscribe = onAuthStateChanged(newAuth, async (user) => {
          console.log('🔐 Auth state changed:', user ? `User ${user.uid} logged in` : 'User logged out');
          
          if (user) {
            setUserId(user.uid);
            setShowAuth(false);
            console.log('🔍 Checking user profile for:', user.uid);
            
            // Check if user has completed onboarding in any collection
            let userProfile = null;
            let userType = null;
            
            try {
              // Check professors collection first
              const professorRef = doc(newDb, `artifacts/${appId}/public/data/professors`, user.uid);
              const professorSnap = await getDoc(professorRef);
              
              if (professorSnap.exists()) {
                userProfile = professorSnap.data();
                userType = 'professor';
              } else {
                // Check students collection
                const studentRef = doc(newDb, `artifacts/${appId}/public/data/students`, user.uid);
                const studentSnap = await getDoc(studentRef);
                
                if (studentSnap.exists()) {
                  userProfile = studentSnap.data();
                  userType = 'student';
                } else {
                  // Fallback to users collection
                  const userRef = doc(newDb, `artifacts/${appId}/public/data/users`, user.uid);
                  const userSnap = await getDoc(userRef);
                  
                  if (userSnap.exists()) {
                    userProfile = userSnap.data();
                    userType = userProfile.userType;
                  }
                }
              }
              
              if (userProfile && userType) {
              // User has completed onboarding
                console.log(`✅ User ${user.uid} found in ${userType} collection, skipping onboarding`);
                console.log('User profile data:', userProfile);
              setShowOnboarding(false);
                setUserType(userType);
                setProfileData(prev => ({ ...prev, ...userProfile, userType }));
            } else {
              // User needs to complete onboarding
                console.log(`⚠️ User ${user.uid} not found in any collection, showing onboarding`);
                setShowOnboarding(true);
                setUserType('');
                setProfileData(prev => ({ ...prev, userType: '' }));
              }
            } catch (error) {
              console.error('Error checking user profile:', error);
              setShowOnboarding(true);
            }
          } else {
            console.log('🚪 User logged out, showing auth form');
            setUserId(null);
            setShowAuth(true);
            setShowOnboarding(false);
            setUserType('');
            setProfileData(prev => ({ ...prev, userType: '' }));
          }
          setIsAuthReady(true);
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (e) {
        console.error('Initialization Error:', e);
        setMessage(`Failed to initialize application: ${e.message}`);
        setLoading(false);
      }
    };
    initFirebase();
  }, []);

  // 2. FETCH USER PROFILE DATA (Real Firestore)
  const fetchProfile = useCallback(async (uid) => {
    if (!db || !uid) return;
    try {
      const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setProfileData(userData);
        // Set userType from profile data
        if (userData.userType) {
          setUserType(userData.userType);
        }
      } else {
        setMessage('Welcome! Please complete your academic profile.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage(`Failed to load profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (isAuthReady && userId) {
      fetchProfile(userId);
    }
  }, [isAuthReady, userId, fetchProfile]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  // Set user type manually (for existing users)
  const setUserTypeManually = async (newUserType) => {
    if (!db || !userId) return;
    
    try {
      // Determine the correct collection based on newUserType
      let collectionPath;
      if (newUserType === 'professor') {
        collectionPath = `artifacts/${appId}/public/data/professors`;
      } else if (newUserType === 'student') {
        collectionPath = `artifacts/${appId}/public/data/students`;
      } else {
        collectionPath = `artifacts/${appId}/public/data/users`;
      }
      
      console.log(`🔄 Setting user type to ${newUserType} in collection: ${collectionPath}`);
      
      const userDocRef = doc(db, collectionPath, userId);
      await setDoc(userDocRef, {
        userType: newUserType,
        lastUpdated: new Date()
      }, { merge: true });
      
      setUserType(newUserType);
      setProfileData(prev => ({ ...prev, userType: newUserType }));
      setMessage(`User type set to ${newUserType}`);
    } catch (error) {
      console.error('Error setting user type:', error);
      setMessage('Error setting user type. Please try again.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      setMessage('Authentication not ready. Please wait.');
      return;
    }
    setLoading(true);
    try {
      // CRITICAL: Convert keywords string to a lowercase array for searching
      let keywordsArray = [];
      if (profileData.keywords) {
        if (typeof profileData.keywords === 'string') {
          keywordsArray = profileData.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
        } else if (Array.isArray(profileData.keywords)) {
          keywordsArray = profileData.keywords.map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
        }
      }
      
      const dataToSave = {
          ...profileData,
          keywords: keywordsArray, // Store as array for the 'array-contains' query to work
      };

      // Save to appropriate collection based on user type
      let collectionPath;
      if (profileData.userType === 'professor') {
        collectionPath = `artifacts/${appId}/public/data/professors`;
      } else if (profileData.userType === 'student') {
        collectionPath = `artifacts/${appId}/public/data/students`;
      } else {
        // Fallback to users collection for backward compatibility
        collectionPath = `artifacts/${appId}/public/data/users`;
      }

      console.log(`💾 Saving profile to: ${collectionPath} for userType: ${profileData.userType}`);
      const userDocRef = doc(db, collectionPath, userId);
      await setDoc(userDocRef, dataToSave, { merge: true });
      console.log(`✅ Profile saved successfully to ${collectionPath}`);
      
      setMessage('Profile saved successfully! Ready to connect.');
      
      // Update local state to reflect the data structure sent to Firestore for the keywords field
      setProfileData(prev => ({ ...prev, keywords: profileData.keywords })); 
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage(`Error saving profile: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Authentication Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        // Don't save incomplete profile data - wait for onboarding completion
        if (userCredential.user) {
          console.log('User created successfully, proceeding to onboarding');
        }
        setMessage('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        setMessage('Signed in successfully!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage(`Authentication error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setMessage('You have been signed out.');
        setProfileData({});
      } catch (error) {
        console.error('Logout error:', error);
        setMessage('Logout failed. Try again.');
      }
    }
  };

  // --- ONBOARDING FLOW ---
  const renderOnboarding = () => {
    const onboardingSteps = [
      {
        title: "Welcome to Academic Matchmaker!",
        subtitle: "Let's set up your profile to connect you with the right academic collaborators.",
        content: (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
              <p className="text-gray-600">Are you a student looking for research opportunities or a professor seeking collaborators?</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setUserType('student');
                  setProfileData(prev => ({ ...prev, userType: 'student' }));
                  setOnboardingStep(1);
                }}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-center mb-3">
                  <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold">I'm a Student</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Looking for research opportunities, mentors, and academic collaborations
                </p>
              </button>
              
              <button
                onClick={() => {
                  setUserType('professor');
                  setProfileData(prev => ({ ...prev, userType: 'professor' }));
                  setOnboardingStep(1);
                }}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-center mb-3">
                  <User className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold">I'm a Professor</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Seeking research collaborators, students, and academic partnerships
                </p>
              </button>
            </div>
          </div>
        )
      },
      {
        title: userType === 'student' ? "Student Profile Setup" : "Professor Profile Setup",
        subtitle: "Tell us about your academic background and interests.",
        content: (
          <div className="space-y-8">
            {/* Profile Completion Indicator */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
                <span className="text-sm font-medium text-indigo-600">65% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Complete all sections to improve your profile visibility</p>
            </div>

            {/* Basic Information Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {userType === 'student' ? 'Degree Program' : 'Current Title/Position'} *
                  </label>
                  <input
                    type="text"
                    value={userType === 'student' ? profileData.degree : profileData.title}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      [userType === 'student' ? 'degree' : 'title']: e.target.value 
                    }))}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder={userType === 'student' ? 'PhD in Computer Science' : 'Professor of Biology'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University/Institution *
                  </label>
                  <input
                    type="text"
                    value={profileData.university}
                    onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Stanford University"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Computer Science"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Research Area *
                  </label>
                  <input
                    type="text"
                    value={profileData.researchArea}
                    onChange={(e) => setProfileData(prev => ({ ...prev, researchArea: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Machine Learning, Quantum Computing, etc."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords for Matching (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={profileData.keywords}
                    onChange={(e) => setProfileData(prev => ({ ...prev, keywords: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="AI, machine learning, deep learning, neural networks"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Me / Professional Bio *
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Tell us about your research interests, experience, and what you're looking for in collaborations..."
                  />
                </div>
              </div>
            </div>

            {/* Research Papers Section (Professor Only) */}
            {userType === 'professor' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Research Papers</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newPaper = {
                        id: Date.now(),
                        title: '',
                        abstract: '',
                        year: new Date().getFullYear(),
                        link: '',
                        file: null
                      };
                      setProfileData(prev => ({
                        ...prev,
                        papers: [...(prev.papers || []), newPaper]
                      }));
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Paper
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(profileData.papers || []).map((paper, index) => (
                    <div key={paper.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paper Title
                          </label>
                          <input
                            type="text"
                            value={paper.title}
                            onChange={(e) => {
                              const updatedPapers = [...(profileData.papers || [])];
                              updatedPapers[index].title = e.target.value;
                              setProfileData(prev => ({ ...prev, papers: updatedPapers }));
                            }}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Advanced Machine Learning Techniques"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publication Year
                          </label>
                          <input
                            type="number"
                            value={paper.year}
                            onChange={(e) => {
                              const updatedPapers = [...(profileData.papers || [])];
                              updatedPapers[index].year = parseInt(e.target.value);
                              setProfileData(prev => ({ ...prev, papers: updatedPapers }));
                            }}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="2024"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Abstract/Summary
                          </label>
                          <textarea
                            value={paper.abstract}
                            onChange={(e) => {
                              const updatedPapers = [...(profileData.papers || [])];
                              updatedPapers[index].abstract = e.target.value;
                              setProfileData(prev => ({ ...prev, papers: updatedPapers }));
                            }}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Brief summary of the research..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publication Link
                          </label>
                          <input
                            type="url"
                            value={paper.link}
                            onChange={(e) => {
                              const updatedPapers = [...(profileData.papers || [])];
                              updatedPapers[index].link = e.target.value;
                              setProfileData(prev => ({ ...prev, papers: updatedPapers }));
                            }}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="https://example.com/paper"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedPapers = (profileData.papers || []).filter((_, i) => i !== index);
                              setProfileData(prev => ({ ...prev, papers: updatedPapers }));
                            }}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!profileData.papers || profileData.papers.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No research papers added yet</p>
                      <p className="text-sm">Click "Add Paper" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projects Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {userType === 'professor' ? 'Research Projects' : 'Academic Projects'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProject = {
                      id: Date.now(),
                      title: '',
                      description: '',
                      technologies: '',
                      collaborators: '',
                      fundingAgency: '',
                      startDate: '',
                      endDate: '',
                      link: ''
                    };
                    setProfileData(prev => ({
                      ...prev,
                      projects: [...(prev.projects || []), newProject]
                    }));
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Project
                </button>
              </div>
              
              <div className="space-y-4">
                {(profileData.projects || []).map((project, index) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Title
                        </label>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => {
                            const updatedProjects = [...(profileData.projects || [])];
                            updatedProjects[index].title = e.target.value;
                            setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                          }}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="AI-Powered Research Tool"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {userType === 'professor' ? 'Funding Agency' : 'Technologies Used'}
                        </label>
                        <input
                          type="text"
                          value={userType === 'professor' ? project.fundingAgency : project.technologies}
                          onChange={(e) => {
                            const updatedProjects = [...(profileData.projects || [])];
                            if (userType === 'professor') {
                              updatedProjects[index].fundingAgency = e.target.value;
                            } else {
                              updatedProjects[index].technologies = e.target.value;
                            }
                            setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                          }}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder={userType === 'professor' ? 'NSF, NIH, etc.' : 'Python, React, TensorFlow'}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) => {
                            const updatedProjects = [...(profileData.projects || [])];
                            updatedProjects[index].description = e.target.value;
                            setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                          }}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Describe the project goals, methodology, and outcomes..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={project.startDate}
                          onChange={(e) => {
                            const updatedProjects = [...(profileData.projects || [])];
                            updatedProjects[index].startDate = e.target.value;
                            setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                          }}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={project.endDate}
                          onChange={(e) => {
                            const updatedProjects = [...(profileData.projects || [])];
                            updatedProjects[index].endDate = e.target.value;
                            setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                          }}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2 flex justify-between items-end">
                        <div className="flex-1 mr-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Link / GitHub
                          </label>
                          <input
                            type="url"
                            value={project.link}
                            onChange={(e) => {
                              const updatedProjects = [...(profileData.projects || [])];
                              updatedProjects[index].link = e.target.value;
                              setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                            }}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const updatedProjects = (profileData.projects || []).filter((_, i) => i !== index);
                            setProfileData(prev => ({ ...prev, projects: updatedProjects }));
                          }}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!profileData.projects || profileData.projects.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No projects added yet</p>
                    <p className="text-sm">Click "Add Project" to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Supervision Section (Professor Only) */}
            {userType === 'professor' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 text-indigo-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Student Supervision</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newStudent = {
                        id: Date.now(),
                        name: '',
                        topic: '',
                        status: 'current',
                        startDate: '',
                        endDate: ''
                      };
                      setProfileData(prev => ({
                        ...prev,
                        supervisedStudents: [...(prev.supervisedStudents || []), newStudent]
                      }));
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Student
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(profileData.supervisedStudents || []).map((student, index) => (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student Name
                          </label>
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => {
                              const updatedStudents = [...(profileData.supervisedStudents || [])];
                              updatedStudents[index].name = e.target.value;
                              setProfileData(prev => ({ ...prev, supervisedStudents: updatedStudents }));
                            }}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Research Topic
                          </label>
                          <input
                            type="text"
                            value={student.topic}
                            onChange={(e) => {
                              const updatedStudents = [...(profileData.supervisedStudents || [])];
                              updatedStudents[index].topic = e.target.value;
                              setProfileData(prev => ({ ...prev, supervisedStudents: updatedStudents }));
                            }}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Machine Learning in Healthcare"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={student.status}
                            onChange={(e) => {
                              const updatedStudents = [...(profileData.supervisedStudents || [])];
                              updatedStudents[index].status = e.target.value;
                              setProfileData(prev => ({ ...prev, supervisedStudents: updatedStudents }));
                            }}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="current">Current</option>
                            <option value="completed">Completed</option>
                            <option value="graduated">Graduated</option>
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedStudents = (profileData.supervisedStudents || []).filter((_, i) => i !== index);
                              setProfileData(prev => ({ ...prev, supervisedStudents: updatedStudents }));
                            }}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!profileData.supervisedStudents || profileData.supervisedStudents.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No supervised students added yet</p>
                      <p className="text-sm">Click "Add Student" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Summary Placeholder */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">AI-Generated Summary</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-gray-600 italic">
                  🤖 AI-powered profile summary will appear here once you complete your profile and upload documents.
                  This will help other users quickly understand your research focus and expertise.
                </p>
              </div>
            </div>
          </div>
            
            <div className="flex justify-between pt-6">
              <button
                onClick={() => setOnboardingStep(0)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setOnboardingStep(2)}
                disabled={!profileData.name || !profileData.university || !profileData.researchArea}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )
      },
      {
        title: "Additional Information",
        subtitle: "Help us personalize your experience with some additional details.",
        content: (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {userType === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advisor/Supervisor
                    </label>
                    <input
                      type="text"
                      value={profileData.advisor}
                      onChange={(e) => setProfileData(prev => ({ ...prev, advisor: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Graduation Year
                    </label>
                    <input
                      type="text"
                      value={profileData.graduationYear}
                      onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="2025"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileData.gpa}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gpa: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="3.8"
                    />
                  </div>
                </>
              )}
              
              {userType === 'professor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab/Research Group
                    </label>
                    <input
                      type="text"
                      value={profileData.lab}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lab: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="AI Research Lab"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={profileData.yearsExperience}
                      onChange={(e) => setProfileData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Funding Available
                    </label>
                    <select
                      value={profileData.funding}
                      onChange={(e) => setProfileData(prev => ({ ...prev, funding: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select funding status</option>
                      <option value="yes">Yes, I have funding</option>
                      <option value="limited">Limited funding available</option>
                      <option value="no">No funding available</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select your timezone</option>
                  <option value="UTC-12">UTC-12 (Baker Island)</option>
                  <option value="UTC-8">UTC-8 (Pacific Time)</option>
                  <option value="UTC-5">UTC-5 (Eastern Time)</option>
                  <option value="UTC+0">UTC+0 (GMT)</option>
                  <option value="UTC+1">UTC+1 (Central European)</option>
                  <option value="UTC+5">UTC+5 (Pakistan Standard Time)</option>
                  <option value="UTC+8">UTC+8 (China Standard Time)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <button
                onClick={() => setOnboardingStep(1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCompleteOnboarding}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl w-full">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{onboardingSteps[onboardingStep].title}</h1>
              <div className="flex space-x-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= onboardingStep ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600">{onboardingSteps[onboardingStep].subtitle}</p>
          </div>
          
          {onboardingSteps[onboardingStep].content}
        </div>
      </div>
    );
  };

  // Handle onboarding completion
  const handleCompleteOnboarding = async () => {
    if (!db || !userId) return;
    
    try {
      // Determine the correct collection based on userType
      let collectionPath;
      if (userType === 'professor') {
        collectionPath = `artifacts/${appId}/public/data/professors`;
      } else if (userType === 'student') {
        collectionPath = `artifacts/${appId}/public/data/students`;
      } else {
        collectionPath = `artifacts/${appId}/public/data/users`;
      }
      
      console.log(`🎯 Completing onboarding for ${userType} in collection: ${collectionPath}`);
      
      const userDocRef = doc(db, collectionPath, userId);
      await setDoc(userDocRef, {
        ...profileData,
        userType,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      
      // Update the main userType state
      setUserType(userType);
      
      setShowOnboarding(false);
      setMessage('Profile setup completed successfully!');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setMessage('Error completing setup. Please try again.');
    }
  };

  // --- AUTHENTICATION FORM ---
  const renderAuthForm = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Academic Matchmaker</h1>
          <p className="text-gray-600 mt-2">Connect with researchers worldwide</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={authForm.name}
                onChange={handleAuthInputChange}
                required={authMode === 'signup'}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Dr. Jane Smith"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleAuthInputChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="jane.smith@university.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleAuthInputChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                {authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              authMode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // --- DASHBOARD COMPONENT ---
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {profileData.name || 'Academic'}!
            </h2>
            <p className="text-indigo-100">
              {profileData.userType === 'student' 
                ? 'Ready to find your next research opportunity?' 
                : 'Ready to connect with talented researchers?'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{profileData.userType === 'student' ? '🎓' : '👨‍🏫'}</div>
            <div className="text-sm text-indigo-200">{profileData.userType === 'student' ? 'Student' : 'Professor'}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Smart Matches</p>
              <p className="text-lg font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Chats</p>
              <p className="text-lg font-semibold text-gray-900">5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Connections</p>
              <p className="text-lg font-semibold text-gray-900">23</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Research Areas</p>
              <p className="text-lg font-semibold text-gray-900">{profileData.researchArea ? '1' : '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Matches</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Dr. Sarah Chen</p>
                <p className="text-sm text-gray-500">Stanford University • 95% match</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Dr. Michael Rodriguez</p>
                <p className="text-sm text-gray-500">MIT • 87% match</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('matchmaker')}
              className="w-full flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Search className="w-5 h-5 text-indigo-600 mr-3" />
              <span className="font-medium text-indigo-900">Find Collaborators</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <User className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Update Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Globe className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-medium text-purple-900">Browse Feed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDERING TABS ---

  const renderProfileTab = () => (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-6 flex items-center">
        <User className="w-6 h-6 mr-2 text-indigo-500" />
        {userType === 'professor' ? 'Professor Profile' : userType === 'student' ? 'Student Profile' : 'Academic Profile'}
      </h2>
      
      {/* User Type Selector for existing users */}
      {!userType && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Set Your Role</h3>
          <p className="text-yellow-700 mb-4">Please select your role to access all features:</p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setProfileData(prev => ({ ...prev, userType: 'student' }));
                setShowOnboarding(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              I'm a Student
            </button>
            <button
              onClick={() => {
                setProfileData(prev => ({ ...prev, userType: 'professor' }));
                setShowOnboarding(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              I'm a Professor
            </button>
          </div>
        </div>
      )}

      {/* Profile Completion Indicator */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
          <span className="text-sm font-medium text-indigo-600">
            {userType === 'student' ? '70%' : '65%'} Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
            style={{width: userType === 'student' ? '70%' : '65%'}}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Complete all sections to improve your profile visibility</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-indigo-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                value={profileData.name} 
                onChange={handleInputChange} 
                required 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500" 
                placeholder={userType === 'student' ? 'John Doe' : 'Dr. Eleanor Vance'}
              />
            </div>

            {/* Title/Position or Degree */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'student' ? 'Degree Program' : 'Current Title/Position'}
              </label>
              <input 
                type="text" 
                name="title" 
                id="title" 
                value={profileData.title} 
                onChange={handleInputChange} 
                required 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500" 
                placeholder={userType === 'student' ? 'PhD in Computer Science' : 'Associate Professor of Astrophysics'}
              />
            </div>

            {/* University */}
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">University/Institution</label>
              <input 
                type="text" 
                name="university" 
                id="university" 
                value={profileData.university} 
                onChange={handleInputChange} 
                required 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500" 
                placeholder="MIT / Stanford University"
              />
            </div>

            {/* Department or Semester */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'student' ? 'Current Semester/Year' : 'Department'}
              </label>
              <input 
                type="text" 
                name="department" 
                id="department" 
                value={profileData.department} 
                onChange={handleInputChange} 
                required 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500" 
                placeholder={userType === 'student' ? 'Fall 2024, 3rd Year' : 'Computer Science'}
              />
            </div>

            {/* Research Area or Interests */}
            <div className="md:col-span-2">
              <label htmlFor="researchArea" className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'student' ? 'Research Interests' : 'Primary Research Area'}
              </label>
              <input 
                type="text" 
                name="researchArea" 
                id="researchArea" 
                value={profileData.researchArea} 
                onChange={handleInputChange} 
                required 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500" 
                placeholder={userType === 'student' ? 'Machine Learning, Data Science, AI' : 'Quantum Computing, Epigenetics, or Medieval History'}
              />
            </div>

            {/* Keywords */}
            <div className="md:col-span-2">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">Keywords for Matching (Comma-separated)</label>
              <textarea 
                name="keywords" 
                id="keywords" 
                rows="2" 
                value={profileData.keywords} 
                onChange={handleInputChange} 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500" 
                placeholder="machine learning, natural language processing, deep learning, python"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">About Me / Professional Bio</label>
              <textarea 
                name="bio" 
                id="bio" 
                rows="4" 
                value={profileData.bio} 
                onChange={handleInputChange} 
                required 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500" 
                placeholder={userType === 'student' 
                  ? 'I am passionate about machine learning and its applications in healthcare. Currently working on my thesis...' 
                  : 'I am passionate about connecting theoretical physics with real-world applications...'
                }
              />
            </div>
          </div>
        </div>

        {/* Student-Specific Sections */}
        {userType === 'student' && (
          <>
            {/* CV Upload Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">CV Upload</h3>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload your CV (PDF format)</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setProfileData(prev => ({ ...prev, cvFile: file.name }));
                    }
                  }}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-block"
                >
                  Choose File
                </label>
                {profileData.cvFile && (
                  <p className="text-sm text-green-600 mt-2">✓ {profileData.cvFile}</p>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Skills</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const skill = prompt('Enter a skill:');
                    if (skill && skill.trim()) {
                      setProfileData(prev => ({
                        ...prev,
                        skills: [...(prev.skills || []), skill.trim()]
                      }));
                    }
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Skill
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(profileData.skills || []).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => {
                        const updatedSkills = (profileData.skills || []).filter((_, i) => i !== index);
                        setProfileData(prev => ({ ...prev, skills: updatedSkills }));
                      }}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              {(!profileData.skills || profileData.skills.length === 0) && (
                <p className="text-gray-500 text-center py-4">No skills added yet. Click "Add Skill" to get started.</p>
              )}
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Heart className="w-6 h-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Achievements & Awards</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newAchievement = {
                      id: Date.now(),
                      title: '',
                      description: '',
                      date: '',
                      platform: ''
                    };
                    setProfileData(prev => ({
                      ...prev,
                      achievements: [...(prev.achievements || []), newAchievement]
                    }));
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Achievement
                </button>
              </div>
              
              <div className="space-y-4">
                {(profileData.achievements || []).map((achievement, index) => (
                  <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Achievement Title</label>
                        <input
                          type="text"
                          value={achievement.title}
                          onChange={(e) => {
                            const updatedAchievements = [...(profileData.achievements || [])];
                            updatedAchievements[index].title = e.target.value;
                            setProfileData(prev => ({ ...prev, achievements: updatedAchievements }));
                          }}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Best Student Paper Award"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform/Organization</label>
                        <input
                          type="text"
                          value={achievement.platform}
                          onChange={(e) => {
                            const updatedAchievements = [...(profileData.achievements || [])];
                            updatedAchievements[index].platform = e.target.value;
                            setProfileData(prev => ({ ...prev, achievements: updatedAchievements }));
                          }}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="IEEE, ACM, University"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input
                          type="date"
                          value={achievement.date}
                          onChange={(e) => {
                            const updatedAchievements = [...(profileData.achievements || [])];
                            updatedAchievements[index].date = e.target.value;
                            setProfileData(prev => ({ ...prev, achievements: updatedAchievements }));
                          }}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedAchievements = (profileData.achievements || []).filter((_, i) => i !== index);
                            setProfileData(prev => ({ ...prev, achievements: updatedAchievements }));
                          }}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={achievement.description}
                          onChange={(e) => {
                            const updatedAchievements = [...(profileData.achievements || [])];
                            updatedAchievements[index].description = e.target.value;
                            setProfileData(prev => ({ ...prev, achievements: updatedAchievements }));
                          }}
                          rows={2}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Brief description of the achievement..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!profileData.achievements || profileData.achievements.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No achievements added yet</p>
                    <p className="text-sm">Click "Add Achievement" to get started</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Verification Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input 
                id="isVerified" 
                name="isVerified" 
                type="checkbox" 
                checked={profileData.isVerified} 
                onChange={handleInputChange} 
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isVerified" className="font-medium text-gray-700 flex items-center cursor-pointer">
                <CheckCheck className="w-5 h-5 mr-1 text-green-500" />
                Verification Status (Simulated)
              </label>
              <p className="text-gray-500">Check this box to simulate profile verification by an internal module.</p>
            </div>
          </div>
        </div>

        {/* AI Summary Placeholder */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">AI-Generated Summary</h3>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="text-gray-600 italic">
              🤖 AI-powered profile summary will appear here once you complete your profile and upload documents.
              This will help other users quickly understand your {userType === 'student' ? 'academic background and skills' : 'research focus and expertise'}.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t mt-8">
          <button
            type="submit"
            disabled={loading || !userId}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-xl text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Send className="w-5 h-5 mr-2" />}
            {profileData.name ? 'Update Profile' : 'Save & Join Network'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderFeedTab = () => (
    <div className="max-w-4xl mx-auto">
      <PostCreator 
        db={db} 
        userId={userId} 
        userName={profileData.name} 
        userTitle={profileData.title} 
        onPostCreated={() => {}}
      />
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <Globe className="w-6 h-6 mr-2 text-indigo-500" />
        Global Academic Feed
      </h3>
      <PostsFeed 
        db={db} 
        isAuthReady={isAuthReady} 
        userId={userId} 
      />
    </div>
  );

  const renderMatchmakerTab = () => (
    <Matchmaker 
      db={db} 
      userId={userId} 
      userName={profileData.name} 
      userType={userType}
      onStartConversation={async (partner) => {
        // Create chat document immediately to persist it
        if (db && userId && partner.userId) {
          try {
            const participants = [userId, partner.userId].sort();
            const chatId = participants.join('_');
            
            const chatRef = doc(db, `artifacts/${appId}/public/data/chats`, chatId);
            const chatSnap = await getDoc(chatRef);
            
            if (!chatSnap.exists()) {
              await setDoc(chatRef, {
                participants: participants,
                createdAt: serverTimestamp(),
                lastMessage: '',
                lastMessageTime: serverTimestamp(),
                lastMessageSender: ''
              });
              console.log('✅ Created new chat:', chatId, 'with participants:', participants);
            } else {
              console.log('✅ Chat already exists:', chatId, 'with participants:', participants);
            }
          } catch (error) {
            console.error('Error creating chat:', error);
          }
        }
        
        setPendingConversation(partner);
        setActiveTab('chats');
      }}
    />
  );

  const renderChatsTab = () => (
    <div className="max-w-4xl mx-auto">
      <ChatsManager 
        db={db} 
        userId={userId} 
        userName={profileData.name || 'User'} 
        userType={userType}
        pendingConversation={pendingConversation}
        onConversationStarted={() => setPendingConversation(null)}
      />
    </div>
  );


  // --- UI RENDER ---

  if (loading && !isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mr-3" />
        <p className="text-lg text-gray-700">Connecting to Academic Network...</p>
      </div>
    );
  }

  // Show authentication form if user is not logged in
  if (showAuth && !userId) {
    return renderAuthForm();
  }

  // Show onboarding if user is logged in but hasn't completed setup
  if (showOnboarding && userId) {
    console.log('📝 Showing onboarding for user:', userId);
    return renderOnboarding();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
      <script src="https://cdn.tailwindcss.com"></script>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white shadow-lg rounded-xl mb-6 sticky top-4 z-10">
        <h1 className="text-3xl font-bold text-indigo-700 flex items-center mb-2 sm:mb-0">
          <GraduationCap className="w-8 h-8 mr-2" />
          Academic Matchmaker
        </h1>
        {userId && (
          <div className="text-sm text-gray-600 flex items-center space-x-4">
            <span className="truncate hidden md:inline">
              **User ID:** <code className="bg-gray-100 p-1 rounded text-xs text-indigo-600 font-mono">{userId}</code>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition duration-150 shadow"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </button>
          </div>
        )}
      </header>
      
      {/* Message and Status Area */}
      {message && (
        <div className={`p-3 mb-4 rounded-lg shadow-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} transition-opacity duration-300`}>
          {message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 max-w-4xl mx-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 flex items-center font-medium ${activeTab === 'dashboard' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BookOpen className="w-5 h-5 mr-2" /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('matchmaker')}
          className={`px-4 py-2 flex items-center font-medium ${activeTab === 'matchmaker' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Zap className="w-5 h-5 mr-2" /> Matchmaker
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 flex items-center font-medium ${activeTab === 'feed' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Globe className="w-5 h-5 mr-2" /> Global Feed
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-4 py-2 flex items-center font-medium ${activeTab === 'chats' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare className="w-5 h-5 mr-2" /> Chats
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 flex items-center font-medium ${activeTab === 'profile' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Edit2 className="w-5 h-5 mr-2" /> Profile
        </button>
        {userType === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 flex items-center font-medium ${activeTab === 'admin' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <User className="w-5 h-5 mr-2" /> Admin
          </button>
        )}
      </div>
      
      {/* Content Area */}
      <main>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'matchmaker' && renderMatchmakerTab()}
        {activeTab === 'chats' && renderChatsTab()}
        {activeTab === 'admin' && <AdminDashboard db={db} userId={userId} />}
      </main>

      <footer className="text-center mt-10 text-gray-500 text-sm">
        <p>Built using React, Tailwind CSS, and Google Firestore.</p>
      </footer>

      {/* Floating Chat Assistant */}
      <ChatAssistant userType={userType} profileData={profileData} />
    </div>
  );
};

export default App;
