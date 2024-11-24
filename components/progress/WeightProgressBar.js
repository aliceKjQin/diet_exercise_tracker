"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "../sharedUI/Loading";
import UpdateInputButton from "../sharedUI/UpdateInputButton";

export default function WeightProgressBar({
  startingWeight,
  targetWeight,
  userId,
  inactiveDiet,
  isActive,
  finalWeight,
}) {
  // ***  decouple the displayed currentWeight (used for the progress bar) from the input currentWeight, to ensure the progress bar updates only after the user clicks "Update" and the value is successfully saved
  const [currentWeight, setCurrentWeight] = useState("")// state for progressBar
  const [inputWeight, setInputWeight] = useState(""); // state for input field
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { weightUnit } = useWeightUnit();
  const { activeDiet, refetchActiveDiet } = useAuth();

  // fetch currentWeight of activeDiet for progress page view
  useEffect(() => {
    if (activeDiet) {
      setCurrentWeight(activeDiet.details?.currentWeight || ""); // for progressBar
      setInputWeight(activeDiet.details?.currentWeight || ""); // for input field
    }
  }, [activeDiet]);

  // fetch currentWeight of inactiveDiet from db for history review page
  useEffect(() => {
    if (inactiveDiet) {
      setCurrentWeight(inactiveDiet.details?.currentWeight);
    }
  }, [inactiveDiet]);

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
    // Check if there is any unclear error before submission
    if (error) {
      setError(error)
      return
    }
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        [`diets.${activeDiet.name}.currentWeight`]: parseFloat(inputWeight),
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
      <h2 className="font-bold">
        <i className="fa-solid fa-weight-scale mr-2"></i>
        {progressPercentage.toFixed(0)}% to Target Weight {targetWeight} (
        {weightUnit})
      </h2>
      {/* Progress Bar */}
      <div className="w-full bg-stone-200 rounded-full h-8 sm:h-12">
        <div
          className="bg-emerald-400 h-8 sm:h-12 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Display Current Weight Input only for active diets */}
      {isActive ? (
        <>
          {/* update currentWeight field */}
          <div className="flex mx-auto flex-col gap-2 font-semibold">
            <label htmlFor="currentWeight" className="text-center">
              Current Weight ({weightUnit}):
            </label>
            <div className="relative flex">
              <input
                type="text"
                id="currentWeight"
                value={inputWeight}
                onChange={handleInputWeightChange}
                className="flex-1 p-2 border border-solid text-stone-700 border-pink-300 rounded-full outline-none"
              />
              <UpdateInputButton
                onClick={handleSaveWeight}
                className="bg-pink-400 hover:bg-pink-300"
              />
            </div>
          </div>
          {/*  loading and message state */}
          {loading && <Loading />}
          {error && (
            <p className="text-pink-200 flex-1 text-center">
              {error} <i className="fa-regular fa-circle-xmark fa-lg"></i>
            </p>
          )}
          {successMessage && (
            <p className="text-green-200 flex-1 text-center">
              {successMessage}{" "}
              <i className="fa-regular fa-square-check fa-lg"></i>
            </p>
          )}
        </>
      ) : (
        <p className="font-semibold text-center">
          {" "}
          Final Weight: {currentWeight} ({weightUnit})
        </p>
      )}
    </div>
  );
}
