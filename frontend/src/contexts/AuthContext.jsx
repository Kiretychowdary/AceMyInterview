// NMKRSPVLIDATAPERMAENE
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../config/firebaseClient";

const AuthContext = createContext();

// Export the context itself for other components that might need it
export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Listen to Firebase auth state changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      }, (error) => {
        console.warn("Firebase auth state error:", error.message);
        setUser(null);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.warn("Firebase auth initialization error:", error.message);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.warn("Logout error (continuing anyway):", error.message);
      setUser(null);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      console.log('🔵 Attempting login...', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('🔵 Login response:', { 
        user: userCredential.user?.email,
        uid: userCredential.user?.uid
      });
      
      return { data: userCredential, error: null };
    } catch (error) {
      console.error("❌ Email sign in error:", error.message);
      return { data: null, error };
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      console.log('🔵 Starting signup...', { email });
      
      // Create account with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Account created');
      console.log('✅ Auto-logged in');
      
      setUser(userCredential.user);
      return { data: userCredential, error: null };
      
    } catch (error) {
      console.error("❌ Email sign up error:", error.message);
      
      // Handle Firebase specific errors
      if (error.code === 'auth/email-already-in-use') {
        error.message = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        error.message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        error.message = 'Invalid email address.';
      }
      
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      
      console.log('✅ Google sign in successful:', userCredential.user?.email);
      return { data: userCredential, error: null };
    } catch (error) {
      console.error("Google sign in error:", error.message);
      
      // Handle Firebase specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        error.message = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        error.message = 'Popup was blocked by browser. Please allow popups for this site.';
      }
      
      return { data: null, error };
    }
  };

  const value = {
    user,
    logout,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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