"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "../shared/Loading";

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
  const [inputWeight, setInputWeight] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { weightUnit } = useWeightUnit();
  const { activeDiet, refetchActiveDiet } = useAuth();

  useEffect(() => {
    if (activeDiet) {
      setCurrentWeight(activeDiet.details?.currentWeight || ""); // reset for progressBar
      setInputWeight(activeDiet.details?.currentWeight || ""); // reset for input field
    }
  }, [activeDiet]);

  // Handle currentWeight input change
  const handleInputWeightChange = (e) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      setError("");
      setInputWeight(inputValue); //Keep as string to preserve decimal during editing, then use parseFloat() before saving
    } else {
      setError("Please enter a valid number.");
    }
  };

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
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        [`diets.${dietName}.currentWeight`]: parseFloat(inputWeight),
      });
      await refetchActiveDiet();
      setCurrentWeight(inputWeight); // Update currentWeight for progressBar
      setSuccessMessage("Weight updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error updating currentWeight: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-indigo-400 p-4 rounded-lg text-white">
      <h3 className="font-bold">
        <i className="fa-solid fa-weight-scale"></i>{" "}
        {progressPercentage.toFixed(0)}% to Target Weight {targetWeight} (
        {weightUnit})
      </h3>
      {/* Progress Bar */}
      <div className="w-full bg-stone-200 rounded-full h-8 sm:h-12">
        <div
          className="bg-emerald-400 h-8 sm:h-12 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Display Current Weight Input only for active diets */}
      {isActive ? (
        <div className="flex flex-col justify-center items-center gap-2 font-semibold">
          <label htmlFor="currentWeight">
            Update Current Weight ({weightUnit}):
          </label>
          <div className="flex">
            <input
              type="text"
              id="currentWeight"
              value={inputWeight}
              onChange={handleInputWeightChange}
              className="w-20 p-2 border rounded text-stone-700"
            />
            <button
              onClick={handleSaveWeight}
              className="bg-pink-400 text-white px-3 py-1 rounded font-bold"
            >
              Update
            </button>
          </div>
          {loading && <Loading />}
          {error && <p className="text-red-500">{error}</p>}
          {successMessage && <p className="text-green-200">{successMessage}</p>}
        </div>
      ) : (
        <p className="font-semibold text-center">
          {" "}
          Final Weight: {finalWeight} ({weightUnit})
        </p>
      )}
    </div>
  );
}