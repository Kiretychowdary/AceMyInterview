import React, { useState, useEffect } from 'react';
import { auth } from "../components/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

    const logout = () => {
    auth.signOut().then(() => {
      console.log("User signed out successfully.");
      setUser(null);
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    console.log("AuthProvider rendered with user:", user),
    <AuthContext.Provider value={{ user ,logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;