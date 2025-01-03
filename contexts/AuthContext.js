"use client";

import { db, auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useContext, useState, useEffect, createContext } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDataObj, setUserDataObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDiet, setActiveDiet] = useState(null);

  // Auth handlers
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserDataObj(null);
    setUser(null);
    return signOut(auth);
  }

  // Function to send a password reset email
  function sendPasswordReset(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // get userDataObj and activeDiet when page reload
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        // Set the user to local context state
        setLoading(true);
        setUser(user);
        if (!user) {
          console.log("No User Found");
          return;
        }

        // if user exists, fetch data from firebase database
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        let firebaseData = {};
        if (docSnap.exists()) {
          firebaseData = docSnap.data();
        }
        setUserDataObj(firebaseData);

        // Get active diet
        const diets = firebaseData.diets || {};
        const activeDiet = Object.entries(diets).find(
          ([, dietDetails]) => dietDetails.isActive
        );
        if (activeDiet) {
          setActiveDiet({ name: activeDiet[0], details: activeDiet[1] });
        } else {
          setActiveDiet(null); // set to null if no active diet
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    activeDiet,
    setActiveDiet,
    loading,
    signup,
    login,
    logout,
    sendPasswordReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
