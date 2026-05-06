"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User } from "./types";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  userProfile: User | null; // alias for userData for backwards compatibility
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: boolean;
  isWorker: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserProfile = async (firebaseUser: FirebaseUser) => {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() } as User;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser);
        if (profile?.active) {
          setUserData(profile);
        } else {
          setUserData(null);
          await firebaseSignOut(auth);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(credential.user);

    if (!profile) {
      await firebaseSignOut(auth);
      throw new Error("No team account profile was found for this login.");
    }

    if (!profile.active) {
      await firebaseSignOut(auth);
      throw new Error("This team account is inactive.");
    }

    setUserData(profile);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error("You must be signed in to change your password.");
    }

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  const isAdmin = userData?.role === "admin";
  const isWorker = userData?.role === "worker" || userData?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        userProfile: userData,
        loading,
        signIn,
        signOut,
        changePassword,
        isAdmin,
        isWorker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
