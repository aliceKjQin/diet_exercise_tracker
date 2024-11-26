"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const { user } = useAuth();

  // Fetch and save the user's chosen theme to the database instead of localStorage to ensure it persists across devices
  useEffect(() => {
    const fetchTheme = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().theme) {
            const savedTheme = userDoc.data().theme;
            setTheme(savedTheme);
            document.documentElement.classList.add(savedTheme);
          } else {
            // Set default theme to "dark" for new users
            await updateDoc(doc(db, "users", user.uid), { theme: "dark" });
            setTheme("dark");
            document.documentElement.classList.add("dark");
          }
        } catch (error) {
          console.error("Error fetching theme: ", error);
        }
      } else {
        // Fallback to localStorage if no user exists (unauthenticated users)
        const savedTheme = localStorage.getItem("theme") || "dark";
        setTheme(savedTheme);
        document.documentElement.classList.add(savedTheme);
      }
    };

    fetchTheme()
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // Update local theme
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    // Save new theme to db
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {theme: newTheme})
      } catch (error) {
        console.error("Error updating theme in db: ", error)
      }
    } else {
      // Fallback to localStorage for unauthenticated users
      localStorage.setItem("theme", newTheme);
    }

  };
  // Only render children once the theme has been determined
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
