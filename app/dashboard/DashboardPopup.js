'use client'

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function DashboardPopup({day, month , year, dietName}) {
  const [showPopup, setShowPopup] = useState(false);
  const { activeDiet, setActiveDiet, user } = useAuth();

  // Check last logged Date for popup
  useEffect(() => {
    if (activeDiet) {
      const lastLoggedDate = activeDiet.details?.lastLoggedDate;
      const today = `${year}-${month + 1}-${day}`; // Format:YYYY-MM-DD

      if (lastLoggedDate !== today) {
        setShowPopup(true); // Show popup if the user hasn't logged today
      }
    }
  }, [activeDiet, day, month, year]);

  const handleDismissPopup = async () => {
    const today = `${year}-${month + 1}-${day}`;

    try {
      // Update local state
      setActiveDiet((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          lastLoggedDate: today, // Update the specific property
        },
      }));

      // Update db
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`diets.${dietName}.lastLoggedDate`]: today,
      });

      console.log("Popup dismissed and last logged date updated.");
      setShowPopup(false);
    } catch (error) {
      console.error("Error updating last logged date: ", error);
    }
  };

  return (
    <>
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          aria-describedby="popup-description"
        >
          <div className="bg-indigo-500 text-white p-6 rounded-lg shadow-lg w-96">
            <h2 id="popup-title" className="text-lg font-bold mb-4 text-center">
              Don&apos;t Forget to Log!
            </h2>
            <div id="popup-description" className="mb-4 text-center gap-2">
              Make sure to log <strong>both</strong> your diet and exercise for
              today to display the matching emoji face!
              <p className="text-2xl">
                ✅ ✅ ={" "}
                <i className="fa-solid fa-face-smile text-green-300"></i>
              </p>
              <p className="text-2xl">
                ✅ ❌ = <i className="fa-solid fa-face-meh text-yellow-300"></i>
              </p>
              <p className="text-2xl">
                ❌ ❌ = <i className="fa-solid fa-face-frown text-red-300"></i>
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleDismissPopup}
                className="bg-pink-400 hover:bg-pink-500 font-bold text-white py-2 px-4 rounded transition duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
