"use client";

import { useEffect, useState } from "react";
import MacroProgressBar from "./MacroProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import Button from "./Button";

export default function NutritionResultsAnalysis() {
  const [ingredientList, setIngredientList] = useState(""); // Raw textarea input
  const [pantryItems, setPantryItems] = useState([]); // Processed array of ingredients
  const [nutritionResults, setNutritionResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    const value = e.target.value;
    setIngredientList(value);
    const items = value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setPantryItems(items);
  };

  // Call Edamam API to analyze entered items
  const analyzePantry = async () => {
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

  const totals =
    nutritionResults.length > 0
      ? calculateTotals()
      : { calories: 0, protein: 0 };

  return (
    <>
      <div className="flex">
        <h2 className="text-xl font-bold w-full">
          Analyze Nutrition{" "}
          <i className="fa-solid fa-chart-simple textGradient dark:text-blue-500"></i>
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
        <p className="text-center">
          Enter an ingredient list, like &quot;1 cup rice, 10 oz chickpeas&quot;, etc.
          Enter each ingredient on a new line.
        </p>

        <textarea
          type="text"
          value={ingredientList}
          onChange={handleTextareaChange}
          placeholder={`1 cup rice\n10 oz chickpeas\n200g broccoli`}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-yellow-100"
        />
        <Button
          text={loading ? "Analyzing" : "Analyze Nutrition"}
          clickHandler={analyzePantry}
          dark
          full
        />

        {error && <p className="text-red-500">{error}</p>}

        {/* Analysis Results */}
        {nutritionResults.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            <div className="overflow-x-auto w-full">
              <table className="w-full border border-stone-300 bg-yellow-50 text-left">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Food</th>
                    <th className="p-2">Protein</th>
                    <th className="p-2">Fat</th>
                    <th className="p-2">Fiber</th>
                    <th className="p-2">Carbs</th>
                    <th className="p-2">Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionResults.map((result, index) => (
                    <tr key={index}>
                      <td className="p-2">{result.quantity}</td>
                      <td className="p-2">{result.unit}</td>
                      <td className="p-2">{result.food}</td>
                      <td className="p-2">{`${result.protein} g`}</td>
                      <td className="p-2">{`${result.fat} g`}</td>
                      <td className="p-2">{`${result.fiber} g`}</td>
                      <td className="p-2">{`${result.carbs} g`}</td>
                      <td className="p-2">{`${result.calories} kcal`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
