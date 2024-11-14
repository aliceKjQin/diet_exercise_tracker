"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { useAuth } from "@/contexts/AuthContext";

export default function WeightProgressBar({
  startingWeight,
  targetWeight,
  userId,
  dietName,
  isActive,
  finalWeight,
}) {
  // ***  decouple the displayed currentWeight (used for the progress bar) from the input currentWeight, to ensure the progress bar updates only after the user clicks "Update" and the value is successfully saved
  const [currentWeight, setCurrentWeight] = useState(
    isActive ? "" : finalWeight
  ); // state for progressBar
  const [inputWeight, setInputWeight] = useState("")
  const [error, setError] = useState("")
  const { weightUnit } = useWeightUnit()
  const { activeDiet, refetchActiveDiet } = useAuth()

  useEffect(() => {
    if (activeDiet) {
      setCurrentWeight(activeDiet.details?.currentWeight || "") // reset for progressBar
      setInputWeight(activeDiet.details?.currentWeight || "") // reset for input field
    }
  }, [activeDiet]);

  // Handle currentWeight input change
  const handleInputWeightChange = (e) => {
    const inputValue = e.target.value

    if (!/^\d*\.?\d*$/.test(inputValue)) {
      setError("Please enter a valid number.");
      return;
    }

    setError("");
    setInputWeight(inputValue); //Keep as string to preserve decimal during editing, then use parseFloat() before saving
  }

  // Calculate the progress percentage
  const progressPercentage =
    startingWeight && targetWeight && currentWeight
      ? startingWeight === targetWeight
        ? 100
        : Math.min(
            Math.max(
              ((startingWeight - currentWeight) /
                (startingWeight - targetWeight)) *
                100,
              0
            ),
            100
          )
      : 0; // Default to 0 if any value is invalid

  // Save the current weight to db
  const handleSaveWeight = async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        [`diets.${dietName}.currentWeight`]: parseFloat(inputWeight),
      });
      await refetchActiveDiet()
      setCurrentWeight(inputWeight) // Update currentWeight for progressBar
      console.log("Weight updated successfully!");
    } catch (error) {
      console.error("Error updating currentWeight: ", error);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 items-center">
      <h3 className=" textGradient dark:text-blue-500 font-bold">
        <i className="fa-solid fa-weight-scale"></i>{" "}
        {progressPercentage.toFixed(0)}% to Target Weight {targetWeight} ({weightUnit})
      </h3>
      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded-full h-8 sm:h-12">
        <div
          className="bg-emerald-400 h-8 sm:h-12 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Display Current Weight Input only for active diets */}
      {isActive ? (
        <>
          <label htmlFor="currentWeight">Update Current Weight ({weightUnit}):</label>
          <div className="flex">
            <input
              type="text"
              id="currentWeight"
              value={inputWeight}
              onChange={handleInputWeightChange}
              className="w-20 p-2 border rounded"
            />
            <button
              onClick={handleSaveWeight}
              className="bg-purple-400 dark:bg-blue-400 text-white px-3 py-1 rounded font-bold"
            >
              Update
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </>
      ) : (
        <p className="textGradient dark:text-blue-500 font-semibold">
          {" "}
          Final Weight: {finalWeight} ({weightUnit})
        </p>
      )}
    </div>
  );
}
