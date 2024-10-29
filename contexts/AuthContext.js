"use client";

import { db, auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
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

  // When the component mounts: The useEffect runs, and it sets up the listener (onAuthStateChanged). This listener checks if a user is logged in or not, and based on that, it fetches user data if the user is logged in.
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
        console.log("Fetching User Data");
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        let firebaseData = {};
        if (docSnap.exists()) {
          console.log("Found User Data");
          firebaseData = docSnap.data();
          console.log(firebaseData);
        }
        setUserDataObj(firebaseData);

        // Fetch active diet
        const diets = firebaseData.diets || {};
        const activeDiet = Object.entries(diets).find(
          ([, dietDetails]) => dietDetails.isActive
        );
        if (activeDiet) {
          setActiveDiet({ name: activeDiet[0], details: activeDiet[1] });
        } else {
          setActiveDiet(null); // Reset if no active diet
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
    userDataObj,
    setUserDataObj,
    activeDiet,
    setActiveDiet,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
