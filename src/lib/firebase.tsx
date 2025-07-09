'use client';

import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyDoutWkotaJvc_OF43XO08naU5-l0JWGQA",
  authDomain: "tumblebunnies-website.firebaseapp.com",
  projectId: "tumblebunnies-website",
  storageBucket: "tumblebunnies-website.appspot.com", // <-- FIXED
  messagingSenderId: "1089905635184",
  appId: "1:1089905635184:web:ca992e643d79ef46aa69b5",
  measurementId: "G-P2B6VNXZK9"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);

export interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  registrationCode: string;
  sessionLengths: number[]; // e.g., [5,6,7,8]
  classIds: string[]; // IDs of classes assigned to this facility
  pricing: {
    [classId: string]: {
      [sessionLength: string]: number;
    };
  };
}

export const db = getFirestore(app);

export interface Registration {
  id: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  facilityId: string;
  facilityName: string;
  children: string[];
  createdAt: number;
}

interface PendingRegistration {
  facilityId: string;
}

export interface Class {
  id: string;
  name: string;
  type: string;
  ageRange: string; // e.g., '2-3', '4-5', etc.
  skillLevel: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  parentName: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'refunded';
  createdAt: number;
  items: Array<{
    classId: string;
    childName: string;
    sessionLength: number;
    price: number;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  getRegistration: (userId: string) => Registration | null;
  getRegistrationAsync: (userId: string) => Promise<Registration | null>;
  getPendingRegistration: (userId: string) => PendingRegistration | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return {};
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred.';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          default:
            errorMessage = 'An error occurred during sign-in.';
        }
      }
      return { error: errorMessage };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getRegistration = (userId: string): Registration | null => {
    try {
      const registrationsString = localStorage.getItem('registrations');
      if (!registrationsString) return null;
      const registrations = JSON.parse(registrationsString);
      return registrations[userId] || null;
    } catch (e) {
      return null;
    }
  };

  const getRegistrationAsync = async (userId: string): Promise<Registration | null> => {
    try {
      const registrationsRef = collection(db, "registrations");
      const q = query(registrationsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Get the most recent registration
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Registration));
      
      // Sort by createdAt descending and return the most recent
      docs.sort((a, b) => b.createdAt - a.createdAt);
      return docs[0];
    } catch (error) {
      console.error("Error fetching registration:", error);
      return null;
    }
  };

  const getPendingRegistration = (userId: string): PendingRegistration | null => {
    try {
      const pendingRegsString = localStorage.getItem('pendingRegistrations');
      if (!pendingRegsString) return null;
      const pendingRegs = JSON.parse(pendingRegsString);
      return pendingRegs[userId] || null;
    } catch (e) {
      return null;
    }
  };


  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmailPassword,
    logout,
    getRegistration,
    getRegistrationAsync,
    getPendingRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
