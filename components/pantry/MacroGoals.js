"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Button from "@/components/shared/Button";
import Link from "next/link";
import Loading from "@/components/shared/Loading";

export default function MacroGoals() {
  const [proteinGoal, setProteinGoal] = useState("");
  const [caloriesGoal, setCaloriesGoal] = useState("");
  const [savedGoals, setSaveGoals] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { activeDiet, refetchActiveDiet, user } = useAuth();

  useEffect(() => {
    if (activeDiet) {
      setProteinGoal(activeDiet.details?.macroGoals?.protein || "");
      setCaloriesGoal(activeDiet.details?.macroGoals?.calories || "");
    }
  }, [activeDiet]);

  // Handle input changes
  const handleProteinChange = (e) => {
    const inputValue = e.target.value;

    if (!/^\d*\.?\d*$/.test(inputValue)) {
      setError("Please enter a valid whole number.");
      return;
    }

    setError("");
    setProteinGoal(inputValue ? Number(inputValue) : "");
  };

  const handleCaloriesChange = (e) => {
    const inputValue = e.target.value;

    if (!/^\d*\.?\d*$/.test(inputValue)) {
      setError("Please enter a valid whole number.");
      return;
    }

    setError("");
    setCaloriesGoal(inputValue ? Number(inputValue) : "");
  };
  // Save the goals to db
  const saveGoals = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`diets.${activeDiet.name}.macroGoals`]: {
          protein: proteinGoal,
          calories: caloriesGoal,
        },
      });

      await refetchActiveDiet();

      setSuccess("Macro goals saved!");
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Failed to save macroGoals: ", error);
      setError("Failed to save macro goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Go back button */}
      <div className=" textGradient dark:text-blue-500 font-bold mb-2">
        <Link href={`/dashboard/${activeDiet?.name}`}>
          <i className="fa-solid fa-circle-arrow-left fa-lg"></i> Go back
        </Link>
      </div>
      <h2 className="text-xl font-bold">
        Set Macro Goals{" "}
        <i className="fa-solid fa-bullseye textGradient dark:text-blue-500"></i>
      </h2>
      <div className="mx-auto p-4 bg-yellow-100 shadow-md rounded-md mb-4 flex  flex-col gap-2">
        <div className=" flex gap-4 mb-4">
          <div className="">
            <label className="block mb-1 font-medium" htmlFor="protein">
              Protein (g)
            </label>
            <input
              type="text"
              id="protein"
              value={proteinGoal}
              onChange={handleProteinChange}
              placeholder="Enter protein goal"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="">
            <label className="block mb-1 font-medium" htmlFor="calories">
              Calories (kcal)
            </label>
            <input
              type="text"
              id="calories"
              value={caloriesGoal}
              onChange={handleCaloriesChange}
              placeholder="Enter calories goal"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <Button
          text={proteinGoal || caloriesGoal ? "Update Goals" : "Save Goals"}
          clickHandler={saveGoals}
          full
          dark
        />

        {loading && <Loading />}
        {success && <p className="text-emerald-500 text-center">{success}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </>
  );
}
