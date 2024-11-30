"use client";

import { useEffect, useState } from "react";
import MacroProgressBar from "@/app/pantry/MacroProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/shared/Button";
import { validateIngredientInput } from "./validateIngredientInput";
import NutritionTableUI from "@/app/pantry/NutritionTableUI";

export default function NutritionResultsAnalysis() {
  const [ingredientList, setIngredientList] = useState(""); // Raw textarea input
  const [pantryItems, setPantryItems] = useState([]); // Processed array of ingredients, will be sent to Edamam API
  const [nutritionResults, setNutritionResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [macroGoals, setMacroGoals] = useState({});
  const { activeDiet } = useAuth();

  // Update macro goals based on active diet
  useEffect(() => {
    if (activeDiet) {
      setMacroGoals(activeDiet.details?.macroGoals || {});
    }
  }, [activeDiet]);

  // Handle textarea change and parse input into array
  const handleTextareaChange = (e) => {
    const input = e.target.value;
    setIngredientList(input);

    const { isValid, validLines, errors } = validateIngredientInput(input);

    if (isValid) {
      setPantryItems(validLines);
      setError(""); // Clear previous error if any
    } else {
      setPantryItems([]); // Clear pantryItems(the array will be sent to Edamam API) on invalid input.
      setError(errors); // Show all error lines
    }
  };

  // Call Edamam API to analyze entered items
  const analyzePantry = async () => {
    // Check if any unclear error before submission
    if (error) {
      setError(error);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pantryItems }),
      });

      if (!response.ok) {
        const errResponse = await response.json();
        throw new Error(errResponse.error || "An unknown error occurred.");
      }

      const data = await response.json();
      setNutritionResults(data.nutritionResults);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total calories and protein
  const calculateTotals = () => {
    return nutritionResults.reduce(
      (totals, item) => {
        totals.calories += item.calories || 0;
        totals.protein += item.protein || 0;
        return totals;
      },
      { calories: 0, protein: 0 }
    );
  };

  // Get total of Cal & Protein when there is nutrition results return from API
  const totals =
    nutritionResults.length > 0
      ? calculateTotals()
      : { calories: 0, protein: 0 };

  return (
    <>
      <div className="flex">
        <h2 className="text-xl font-bold w-full">
          <i className="fa-solid fa-chart-simple textGradient dark:text-blue-500 mr-2"></i>
          Analyze Nutrition
        </h2>
        <div id="edamam-badge" className="justify-end">
          <img
            src="/images/Edamam_Badge.svg"
            alt="Edamam Badge"
            width={200}
            height={200}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-purple-100 dark:bg-sky-100 p-6 shadow-md rounded-lg">
        {/* Instruction text */}
        <p className="text-center">
          Enter an ingredient list, like &quot;1 cup rice, 10 oz
          chickpeas&quot;, etc.
          <span className="underline decoration-red-300 decoration-2 underline-offset-4">
            {" "}
            Enter each ingredient on a new line.
          </span>
        </p>

        <textarea
          type="text"
          value={ingredientList}
          onChange={handleTextareaChange}
          placeholder={`1 cup rice\n10 oz chickpeas\n200 g broccoli`}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-yellow-100"
        />
        <Button
          text={loading ? "Analyzing" : "Analyze Nutrition"}
          clickHandler={analyzePantry}
          dark
          full
        />

        {/* Render error conditionally based on type: an array (error from validation check) or a string (error from API or predefined error) */}
        {Array.isArray(error) ? (
          <ul className="text-red-500">
            {error.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">{error}</p>
        )}

        {/* Analysis Results */}
        {nutritionResults.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            {/* Nutrition table */}
            <NutritionTableUI nutritionResults={nutritionResults} />

            {/* Macro Progress Bar */}
            <div className="mt-4 flex flex-col gap-4">
              <h4 className="text-lg font-semibold text-center">
                Progress Towards Macro Goals
              </h4>
              {macroGoals.calories ? (
                <MacroProgressBar
                  current={totals.calories}
                  goal={macroGoals.calories}
                  label="Calories"
                  unit="kcal"
                />
              ) : (
                <p>No calories goal set yet.</p>
              )}
              {macroGoals.protein ? (
                <MacroProgressBar
                  current={totals.protein}
                  goal={macroGoals.protein}
                  label="Protein"
                  unit="g"
                />
              ) : (
                <p>No protein goal set yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
