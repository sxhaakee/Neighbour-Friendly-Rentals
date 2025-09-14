# NFRR - Neighbour Friendly Rental Resource

A modern, full-stack rental platform built with React, TypeScript, and Tailwind CSS that allows neighbors to rent items from each other.

## 🚀 Features

- 🔐 **User Authentication** - Secure user registration and login
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🎨 **Modern UI** - Beautiful interface with Framer Motion animations
- 📦 **Item Management** - Add, edit, and delete rental listings
- 🔍 **Search & Filter** - Find items by category, price, and location
- 💬 **User Profiles** - Manage your listings and rental history
- 📸 **Image Upload** - Upload multiple photos for your listings
- 🚀 **Real-time Data** - Database integration ready
- 💰 **Pricing in Rupees** - Indian currency support

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend Options**: Firebase, Supabase, or any REST API

## �� Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sxhaakee/NFRR.git
   cd NFRR
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄 Database Setup

### Option 1: Firebase Setup

#### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Create a project"
- Follow the setup wizard

#### 2. Enable Authentication
```bash
# Install Firebase SDK
npm install firebase
```

- Go to Authentication > Sign-in method
- Enable Email/Password provider
- Configure authorized domains

#### 3. Create Firestore Database
- Go to Firestore Database
- Click "Create database"
- Choose "Start in production mode"
- Select a location

#### 4. Set up Storage
- Go to Storage
- Click "Get started"
- Choose "Start in production mode"

#### 5. Configure Environment Variables
Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

#### 6. Firebase Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all listings
    match /listings/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null;
    }
    
    // Users can manage their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### 7. Firebase Integration Code

Create `src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Option 2: Supabase Setup

#### 1. Create Supabase Project
- Go to [Supabase](https://supabase.com/)
- Click "New Project"
- Choose organization and enter project details

#### 2. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

#### 3. Configure Environment Variables
Create `.env` file:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 4. Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create listings table
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  condition TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  availability TEXT DEFAULT 'Available',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
```

#### 5. Supabase Integration Code

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Option 3: Custom REST API

#### 1. Backend Setup (Node.js/Express Example)
```bash
# Create backend directory
mkdir nfrr-backend
cd nfrr-backend
npm init -y
npm install express cors multer jsonwebtoken bcryptjs mongoose
```

#### 2. API Endpoints Structure
```javascript
// Example API endpoints
GET    /api/listings          // Get all listings
GET    /api/listings/:id      // Get single listing
POST   /api/listings          // Create listing
PUT    /api/listings/:id      // Update listing
DELETE /api/listings/:id      // Delete listing

POST   /api/auth/register     // User registration
POST   /api/auth/login        // User login
GET    /api/auth/profile      // Get user profile

POST   /api/upload            // Upload images
```

## 🔧 Implementation Guide

### 1. Authentication Context
Create `src/contexts/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### 2. Listings Service
Create `src/lib/listingsService.ts`:
```typescript
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const createListing = async (listingData) => {
  const docRef = await addDoc(collection(db, 'listings'), {
    ...listingData,
    createdAt: new Date(),
    availability: true
  });
  return docRef.id;
};

export const getListings = async () => {
  const querySnapshot = await getDocs(collection(db, 'listings'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const uploadImage = async (file) => {
  const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
```

### 3. Update AddItem Component
Modify `src/pages/AddItem.tsx` to use the database:
```typescript
import { createListing, uploadImage } from '../lib/listingsService';
import { useAuth } from '../contexts/AuthContext';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Upload images
    const imageUrls = await Promise.all(
      images.map(image => uploadImage(image))
    );

    // Create listing
    const listingData = {
      ...formData,
      price: parseInt(formData.price),
      ownerId: currentUser.uid,
      ownerName: currentUser.displayName,
      ownerEmail: currentUser.email,
      imageUrls
    };

    await createListing(listingData);
    navigate('/listings');
  } catch (error) {
    console.error('Error adding item:', error);
  } finally {
    setLoading(false);
  }
};
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy!

### Netlify
1. Build: `npm run build`
2. Deploy `dist` folder
3. Add environment variables

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📱 Features Overview

### Current Features
- ✅ Responsive design
- ✅ Item browsing and filtering
- ✅ Detailed item view
- ✅ Add new items form
- ✅ Price display in rupees
- ✅ Image upload interface
- ✅ Modern UI with animations

### Ready for Integration
- 🔄 User authentication
- 🔄 Database storage
- 🔄 Image storage
- 🔄 Real-time updates
- 🔄 User profiles
- 🔄 Reviews system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email your-email@example.com or create an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
