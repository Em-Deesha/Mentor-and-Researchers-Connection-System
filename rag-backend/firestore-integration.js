// Firestore Integration for Professor Data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration (same as frontend)
const firebaseConfig = {
  apiKey: "AIzaSyBXdC23TpcXdS2FCrwejDHkmbcQafmBq50",
  authDomain: "academic-matchmaker-prod.firebaseapp.com",
  projectId: "academic-matchmaker-prod",
  storageBucket: "academic-matchmaker-prod.firebasestorage.app",
  messagingSenderId: "967137857941",
  appId: "1:967137857941:web:d27ed1253edb32bd2ee69c",
  measurementId: "G-SPZGHFKQT3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to get professors from Firestore
async function getProfessorsFromFirestore() {
  try {
    console.log('🔍 Fetching professors from Firestore...');
    
    // Try different collection paths - prioritize separate professors collection
    const possiblePaths = [
      'artifacts/academic-match-production/public/data/professors',
      'artifacts/academic-matchmaker-prod/public/data/professors',
      'professors',
      'artifacts/academic-match-production/public/data/users', // Fallback to users collection
      'artifacts/academic-matchmaker-prod/public/data/users'
    ];
    
    let professors = [];
    
    for (const path of possiblePaths) {
      try {
        const professorsCollection = collection(db, path);
        const snapshot = await getDocs(professorsCollection);
        
        professors = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          // Filter for professors only if this is a users collection
          if (path.includes('users') && data.userType !== 'professor') {
            return; // Skip non-professors
          }
          
          professors.push({
            id: doc.id,
            ...data,
            // Ensure keywords is an array
            keywords: Array.isArray(data.keywords) ? data.keywords : 
                     (typeof data.keywords === 'string' ? data.keywords.split(',').map(k => k.trim()) : [])
          });
        });
        
        if (professors.length > 0) {
          console.log(`📊 Loaded ${professors.length} professors from Firestore path: ${path}`);
          return professors;
        }
      } catch (pathError) {
        console.log(`⚠️ Path ${path} not accessible:`, pathError.message);
        continue;
      }
    }
    
    console.log('⚠️ No professors found in any Firestore path');
    
    // Fallback: Return sample professor data
    console.log('📚 Using fallback sample professor data');
    return [
      {
        id: 'prof_1',
        name: 'Dr. Sarah Chen',
        title: 'Professor of Computer Science',
        university: 'Stanford University',
        department: 'Computer Science',
        researchArea: 'Machine Learning and AI',
        bio: 'Leading researcher in machine learning with focus on deep learning applications',
        keywords: ['machine learning', 'deep learning', 'artificial intelligence', 'neural networks'],
        email: 'sarah.chen@stanford.edu',
        website: 'https://stanford.edu/~sarahchen'
      },
      {
        id: 'prof_2',
        name: 'Dr. Michael Rodriguez',
        title: 'Professor of Biology',
        university: 'MIT',
        department: 'Biology',
        researchArea: 'Cancer Research and Genomics',
        bio: 'Expert in cancer genomics and personalized medicine',
        keywords: ['cancer', 'genomics', 'personalized medicine', 'oncology', 'genetics'],
        email: 'mrodriguez@mit.edu',
        website: 'https://biology.mit.edu/rodriguez'
      },
      {
        id: 'prof_3',
        name: 'Dr. Emily Watson',
        title: 'Professor of Physics',
        university: 'Caltech',
        department: 'Physics',
        researchArea: 'Quantum Computing and Quantum Mechanics',
        bio: 'Pioneer in quantum computing and quantum information theory',
        keywords: ['quantum computing', 'quantum mechanics', 'quantum information', 'physics'],
        email: 'ewatson@caltech.edu',
        website: 'https://physics.caltech.edu/watson'
      },
      {
        id: 'prof_4',
        name: 'Dr. James Kim',
        title: 'Professor of Chemistry',
        university: 'Harvard University',
        department: 'Chemistry',
        researchArea: 'Drug Discovery and Medicinal Chemistry',
        bio: 'Leading researcher in drug discovery and pharmaceutical chemistry',
        keywords: ['drug discovery', 'medicinal chemistry', 'pharmaceuticals', 'chemistry'],
        email: 'jkim@harvard.edu',
        website: 'https://chemistry.harvard.edu/kim'
      },
      {
        id: 'prof_5',
        name: 'Dr. Lisa Thompson',
        title: 'Professor of Data Science',
        university: 'UC Berkeley',
        department: 'Statistics',
        researchArea: 'Data Science and Statistical Learning',
        bio: 'Expert in statistical learning and big data analytics',
        keywords: ['data science', 'statistics', 'big data', 'analytics', 'machine learning'],
        email: 'lthompson@berkeley.edu',
        website: 'https://statistics.berkeley.edu/thompson'
      }
    ];
    
  } catch (error) {
    console.error('❌ Error fetching professors from Firestore:', error);
    return [];
  }
}

// Function to search professors in Firestore
async function searchProfessorsInFirestore(query) {
  try {
    const professors = await getProfessorsFromFirestore();
    
    // Simple keyword matching (can be enhanced with more sophisticated search)
    const queryLower = query.toLowerCase();
    const matchingProfessors = professors.filter(professor => {
      const searchText = [
        professor.name,
        professor.researchArea,
        professor.university,
        professor.title,
        professor.bio,
        ...(professor.keywords || [])
      ].join(' ').toLowerCase();
      
      return searchText.includes(queryLower);
    });
    
    return matchingProfessors;
  } catch (error) {
    console.error('❌ Error searching professors in Firestore:', error);
    return [];
  }
}

// Function to get students from Firestore
async function getStudentsFromFirestore() {
  try {
    console.log('🔍 Fetching students from Firestore...');
    
    // Try different collection paths - prioritize separate students collection
    const possiblePaths = [
      'artifacts/academic-match-production/public/data/students',
      'artifacts/academic-matchmaker-prod/public/data/students',
      'students',
      'artifacts/academic-match-production/public/data/users', // Fallback to users collection
      'artifacts/academic-matchmaker-prod/public/data/users'
    ];
    
    let students = [];
    
    for (const path of possiblePaths) {
      try {
        const studentsCollection = collection(db, path);
        const snapshot = await getDocs(studentsCollection);
        
        students = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          // Filter for students only if this is a users collection
          if (path.includes('users') && data.userType !== 'student') {
            return; // Skip non-students
          }
          
          students.push({
            id: doc.id,
            ...data,
            // Ensure keywords is an array
            keywords: Array.isArray(data.keywords) ? data.keywords : 
                     (typeof data.keywords === 'string' ? data.keywords.split(',').map(k => k.trim()) : [])
          });
        });
        
        if (students.length > 0) {
          console.log(`📊 Loaded ${students.length} students from Firestore path: ${path}`);
          return students;
        }
      } catch (pathError) {
        console.log(`⚠️ Path ${path} not accessible:`, pathError.message);
        continue;
      }
    }
    
    console.log('⚠️ No students found in any Firestore path');
    return [];
    
  } catch (error) {
    console.error('❌ Error fetching students from Firestore:', error);
    return [];
  }
}

// Function to search students in Firestore
async function searchStudentsInFirestore(query) {
  try {
    const students = await getStudentsFromFirestore();
    
    // Simple keyword matching (can be enhanced with more sophisticated search)
    const queryLower = query.toLowerCase();
    const matchingStudents = students.filter(student => {
      const searchText = [
        student.name,
        student.researchArea || student.interests?.join(' ') || '',
        student.university,
        student.title,
        student.bio,
        ...(student.keywords || [])
      ].join(' ').toLowerCase();
      
      return searchText.includes(queryLower);
    });
    
    return matchingStudents;
  } catch (error) {
    console.error('❌ Error searching students in Firestore:', error);
    return [];
  }
}

export {
  getProfessorsFromFirestore,
  searchProfessorsInFirestore,
  getStudentsFromFirestore,
  searchStudentsInFirestore
};
