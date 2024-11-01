'use client'

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export const useInactiveDiet = (user) => {
  const [inactiveDiets, setInactiveDiets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInactiveDietsData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const docSnapshot = await getDoc(userRef);

        if (docSnapshot.exists()) {
          const diets = docSnapshot.data()?.diets || {};
          const inactiveDietsArray = Object.entries(diets)
            .filter(([, dietDetails]) => !dietDetails.isActive) // Filter for inactive diets
            .map(([name, details]) => ({ name, details })) // Map to an array of objects with name and details
            .sort((a, b) => new Date(b.details.completeDate) - new Date(a.details.completeDate)); // Sort by completeDate
          setInactiveDiets(inactiveDietsArray);
        }
      } catch (error) {
        console.error("Error fetching inactive diets data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInactiveDietsData();
  }, [user]);

  return { inactiveDiets, setInactiveDiets, loading };
};
