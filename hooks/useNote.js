"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

export const useNote = (userId, dietName) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { refetchActiveDiet } = useAuth();

  const fetchNotes = async () => {
    if (!userId || !dietName) return;

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      const dietData = userSnap.data()?.diets?.[dietName]?.dietData || {};

      // Extract notes from dietData
      const extractedNotes = [];
      Object.entries(dietData).forEach(([year, months]) => {
        Object.entries(months).forEach(([month, days]) => {
          Object.entries(days).forEach(([day, data]) => {
            if (data.note) {
              extractedNotes.push({
                displayedDate: `${year}-${Number(month)+1}-${day}`, // month is 0-11, thus needs to + 1 
                date: `${year}-${month}-${day}`,
                note: data.note,
              });
            }
          });
        });
      });

      setNotes(extractedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteDate) => {
    if (!userId || !dietName || !noteDate) return;

    try {
      const [year, month, day] = noteDate.split("-");

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const dietData = userData.diets?.[dietName]?.dietData;

        // Locate the specific date's note and remove the note from the dayData
        const updatedDayData = {
          ...dietData[year]?.[month]?.[day],
        };
        delete updatedDayData.note; // Remove the note

        // Update the dietData in Firestore
        await updateDoc(userRef, {
          [`diets.${dietName}.dietData.${year}.${month}.${day}`]:
            updatedDayData,
        });

        // Refresh notes after deletion to display the updated notes array in ProgressPage
        fetchNotes();

        refetchActiveDiet(); // refetch activeDietDiet to reflect the updated data, which is remove note icon of the specified day in calendar of Dashboard

        setSuccess("Deleted note.");
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setError("Failed to delete note, please try again.")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [userId, dietName]);

  return { notes, fetchNotes, deleteNote, loading, success, error };
};
