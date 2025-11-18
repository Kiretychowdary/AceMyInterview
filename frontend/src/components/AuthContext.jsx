// NMKRSPVLIDATAPERMAENE
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

const AuthContext = createContext();

// Export the context itself for other components that might need it
export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    
    try {
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      });
      
      // Get initial session with error handling
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user || null);
          setLoading(false);
        })
        .catch((error) => {
          console.warn("Supabase session error:", error.message);
          // Set user to null and continue without auth
          setUser(null);
          setLoading(false);
        });
      
      return () => {
        listener?.subscription?.unsubscribe();
      };
    } catch (error) {
      console.warn("Supabase auth initialization error:", error.message);
      // Continue without auth if Supabase fails
      setUser(null);
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.warn("Logout error (continuing anyway):", error.message);
      // Force logout even if Supabase call fails
      setUser(null);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Email sign in error:", error.message);
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get the correct redirect URL based on environment
      const getRedirectURL = () => {
        // For production domain
        if (window.location.hostname === 'acemyinterview.app') {
          return 'https://acemyinterview.app';
        }
        // For localhost development
        if (window.location.hostname === 'localhost') {
          return window.location.origin;
        }
        // Fallback to production URL
        return 'https://acemyinterview.app';
      };

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectURL(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Google sign in error:", error.message);
      return { data: null, error };
    }
  };

  const value = {
    user,
    logout,
    loading,
    signInWithEmail,
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