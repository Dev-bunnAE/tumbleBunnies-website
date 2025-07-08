'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

interface Registration {
  facilityId: string;
}

interface PendingRegistration {
  facilityId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  getRegistration: (userId: string) => Registration | null;
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
