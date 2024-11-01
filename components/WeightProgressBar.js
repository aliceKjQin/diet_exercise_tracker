"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export default function WeightProgressBar({ startingWeight, targetWeight, userId, dietName, isActive, finalWeight }) {
  // Initialize current weight with the starting weight
  const [currentWeight, setCurrentWeight] = useState(isActive ? "" : finalWeight);
  const [inputWeight, setInputWeight] = useState("")

  // Calculate the progress percentage
  const progressPercentage =
    startingWeight  && targetWeight && currentWeight
      ? Math.min(
          Math.max(
            ((startingWeight - currentWeight) /
              (startingWeight - targetWeight)) *
              100,
            0
          ),
          100
        )
      : 0; // Default to 0 if any value is invalid

  // Load the current weight from db on component mount
  useEffect(() => {
    const fetchWeight = async () => {
        try {
            const dietDoc = await getDoc(doc(db, "users", userId))
            if (dietDoc.exists()) {
                const savedWeight = dietDoc.data().diets?.[dietName]?.currentWeight
                if (savedWeight) {
                    setCurrentWeight(savedWeight)
                    setInputWeight(savedWeight)
                }
            }
        } catch (error) {
            console.error("Error fetching currentWeight: ", error)
        }
    }

    fetchWeight()
  }, [userId, dietName])

  // Save the current weight to db
  const handleSaveWeight = async () => {
    try {
        const userDocRef = doc(db, "users", userId)
        await updateDoc(userDocRef, {
            [`diets.${dietName}.currentWeight`]: inputWeight,
        })
        setCurrentWeight(inputWeight) // Update progress bar after saving 
        console.log("Weight updated successfully!")
    } catch (error) {
        console.error("Error updating currentWeight: ", error)
    }
  }

  return (
    <div className="flex flex-col w-full gap-4 items-center">
      <h3 className=" textGradient dark:text-blue-500 font-bold"><i className="fa-solid fa-weight-scale"></i> {progressPercentage.toFixed(0)}% to Target Weight {targetWeight} (kg)</h3>
      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded-full h-8 sm:h-12">
        <div
          className="bg-emerald-400 h-8 sm:h-12 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      

      {/* Display Current Weight Input only for active diets */}
      { isActive ? (<><label htmlFor="current-weight">Update Current Weight (kg):</label>
      <div className="flex">
      <input
        type="number"
        id="current-weight"
        value={inputWeight}
        onChange={(e) => setInputWeight(e.target.value ? Number(e.target.value) : "")}
        className="w-20 p-2 border rounded"
      />
      <button onClick={handleSaveWeight} className="bg-purple-400 dark:bg-blue-400 text-white px-3 py-1 rounded font-bold">
        Update
      </button>
      </div></>) : (<p className="textGradient dark:text-blue-500 font-semibold"> Final Weight: {finalWeight} (kg)</p>)}
      
    </div>
  );
}
