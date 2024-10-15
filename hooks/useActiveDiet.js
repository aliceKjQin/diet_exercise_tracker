'use client'

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export const useActiveDiet = (user) => {
  const [activeDiet, setActiveDiet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveDietData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const docSnapshot = await getDoc(userRef);

        if (docSnapshot.exists()) {
          const diets = docSnapshot.data()?.diets || {};
          const activeDiet = Object.entries(diets).find(
            ([, diet]) => diet.isActive
          );
          if (activeDiet) {
            setActiveDiet({ name: activeDiet[0], details: activeDiet[1] });
          }
        }
      } catch (error) {
        console.error("Error fetching active diet data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveDietData();
  }, [user]);

  return { activeDiet, loading };
};
