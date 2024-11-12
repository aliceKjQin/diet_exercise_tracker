"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Button from "./Button";

export default function MacroGoals() {
  const [proteinGoal, setProteinGoal] = useState("");
  const [caloriesGoal, setCaloriesGoal] = useState("");
//   const [fatGoal, setFatGoal] = useState("");
//   const [carbsGoal, setCarbsGoal] = useState("");
  const [savedGoals, setSaveGoals] = useState(null);
  const [error, setError] = useState("");

  const { activeDiet, user } = useAuth();

  useEffect(() => {
    if (activeDiet) {
      setProteinGoal(activeDiet.details?.macroGoals?.protein || "");
      setCaloriesGoal(activeDiet.details?.macroGoals?.calories || "");
    //   setFatGoal(activeDiet.details?.macroGoals?.fat || "");
    //   setCarbsGoal(activeDiet.details?.macroGoals?.carbs || "");
    }
  }, [activeDiet]);

  // Handle input changes
  const handleProteinChange = (e) => setProteinGoal(e.target.value ? Number(e.target.value) : ""); // check e.target.value will avoid the issue with Number("") evaluating to 0 
  const handleCaloriesChange = (e) => setCaloriesGoal(e.target.value ? Number(e.target.value) : "");
//   const handleFatChange = (e) => setFatGoal(Number(e.target.value));
//   const handleCarbsChange = (e) => setCarbsGoal(Number(e.target.value));

  // Save the goals to db
  const saveGoals = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`diets.${activeDiet.name}.macroGoals`]: {
          protein: proteinGoal,
          calories: caloriesGoal,
        //   fat: fatGoal,
        //   carbs: carbsGoal,
        },
      });
      setSaveGoals({
        protein: proteinGoal,
        calories: caloriesGoal,
        // fat: fatGoal,
        // carbs: carbsGoal,
      });
      console.log("Macro goals saved!");
    } catch (error) {
      console.error("Failed to save macroGoals: ", error);
      setError("Failed to save macro goals. Please try again.");
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold">
        Set Macro Goals{" "}
        <i className="fa-solid fa-bullseye textGradient dark:text-blue-500"></i>
      </h2>
      <div className="mx-auto p-4 bg-yellow-50 shadow-md rounded-md mb-4">
        <div className=" flex gap-4 mb-4">
          <div className="">
            <label className="block mb-1 font-medium" htmlFor="protein">
              Protein (g)
            </label>
            <input
              type="number"
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
              type="number"
              id="calories"
              value={caloriesGoal}
              onChange={handleCaloriesChange}
              placeholder="Enter calories goal"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* <div className="">
            <label className="block mb-1 font-medium" htmlFor="fat">
              Fat (g)
            </label>
            <input
              type="number"
              id="fat"
              value={fatGoal}
              onChange={handleFatChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="">
            <label className="block mb-1 font-medium" htmlFor="carbs">
              Carbs (g)
            </label>
            <input
              type="number"
              id="carbs"
              value={carbsGoal}
              onChange={handleCarbsChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div> */}
        </div>
        {error && <p className="text-red-400">{error}</p>}

        <Button
          text={proteinGoal || caloriesGoal ? "Update Goals" : "Save Goals"}
          clickHandler={saveGoals}
          full
          dark
        />
      </div>
    </>
  );
}
