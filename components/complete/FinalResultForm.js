"use client";

import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Button from "../shared/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightUnit } from "@/contexts/WeightUnitContext";

export default function FinalResultForm({
  userId,
  dietName,
  onSubmissionSuccess,
}) {
  const [finalWeight, setFinalWeight] = useState("");
  const [selectedPros, setSelectedPros] = useState([]);
  const [selectedCons, setSelectedCons] = useState([]);
  const [customPro, setCustomPro] = useState("");
  const [customCon, setCustomCon] = useState("");
  const [conMessage, setConMessage] = useState("");
  const [proMessage, setProMessage] = useState("");
  const [summaryInputValue, setSummaryInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState("");
  const { setActiveDiet, activeDiet, userDataObj, setUserDataObj } = useAuth();
  const { weightUnit } = useWeightUnit();
  const maxWords = 6;

  const prosOptions = [
    "Increased energy",
    "Improved mood",
    "Weight loss",
    "Weight gain",
    "Healthier eating habits",
    "Other",
  ];

  const consOptions = [
    "Hunger pangs",
    "Difficult to maintain",
    "Social eating challenges",
    "Limited food choices",
    "Lack of energy",
    "Other",
  ];

  useEffect(() => {
    if (activeDiet) {
      setFinalWeight(activeDiet.details.currentWeight || "");
    }
  }, [activeDiet]);

  // Handle finalWeight input change
  const handleFinalWeightChange = (e) => {
    const inputValue = e.target.value;

    if (!/^\d*\.?\d*$/.test(inputValue)) {
      setError("Please enter a valid number.");
      return;
    }

    setError("");
    setFinalWeight(inputValue); //Keep as string to preserve decimal during editing, then use parseFloat() before saving
  };

  // Handle pros and cons custom input change
  const handleCustomInputChange = (input, setInput, setMessage) => (e) => {
    const words = e.target.value.trim().split(/\s+/);
    if (words.length <= maxWords) {
      setInput(e.target.value);
      setMessage(""); // Clear the message if within limit
    } else {
      setMessage(`Limit of ${maxWords} words exceeded.`);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Remove "Other" if a custom pro or con is provided, else "Other" will be added in the list along side the custom pro/con
    const finalPros = customPro
      ? [...selectedPros.filter((pro) => pro !== "Other"), customPro]
      : selectedPros;

    const finalCons = customCon
      ? [...selectedCons.filter((con) => con !== "Other"), customCon]
      : selectedCons;

    const prosNcons = {
      pros: finalPros,
      cons: finalCons,
    };

    const updatedDietPlan = {
      isActive: false,
      currentWeight: parseFloat(finalWeight),
      prosNcons,
      summary: summaryInputValue,
      rating,
      completeDate: new Date().toLocaleDateString("en-CA"), // 'en-CA' gives the date format YYYY-MM-DD
    };

    try {
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          diets: {
            [dietName]: updatedDietPlan,
          },
        },
        { merge: true }
      );

      setActiveDiet(null); // Set activeDiet to null after form submission so Dashboard link doesn't appear in Navbar
      // call a function in parent to handle successful submission, i.e. redirect to history page or homePage to start a new diet

      console.log("Updated user data Obj: ", userDataObj);
      onSubmissionSuccess();
    } catch (err) {
      console.error("Error submitting results: ", err);
      setError("Failed to submit results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-4 items-center border rounded-md shadow-lg p-4">
      <h2 className="text-xl font-bold">Submit Your Final Results</h2>

      {error && <p className="text-red-400">{error}</p>}

      {/* Final Weight Input */}
      <div className="flex flex-col items-center">
        <label htmlFor="finalWeight" className="block font-semibold mb-2">
          Final Weight ({weightUnit})
        </label>
        <input
          type="text"
          id="finalWeight"
          value={finalWeight}
          onChange={handleFinalWeightChange}
          className="border border-gray-300 p-2 w-full rounded"
          required
        />
      </div>
      {/* Div for pros and cons */}
      <div className="flex flex-col gap-2 sm:flex-row py-2">
        {/* Pros Selection */}
        <fieldset className="w-full">
          <legend className="block font-semibold">
            Pros of the Diet Plan:
          </legend>
          {prosOptions.map((option) => (
            <label key={option} className="block">
              <input
                type="checkbox"
                value={option}
                checked={selectedPros.includes(option)}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedPros((prev) =>
                    prev.includes(value)
                      ? prev.filter((pro) => pro !== value)
                      : [...prev, value]
                  );
                }}
              />
              {option}
            </label>
          ))}
          {selectedPros.includes("Other") && (
            <input
              type="text"
              placeholder="Enter your own pro"
              value={customPro}
              onChange={handleCustomInputChange(
                customPro,
                setCustomPro,
                setProMessage
              )}
              className="border border-gray-300 p-2 w-full rounded mt-2"
            />
          )}
          {proMessage && <p className="text-red-500">{proMessage}</p>}
        </fieldset>

        {/* Cons Selection */}
        <fieldset className="w-full">
          <legend className="block font-semibold">
            Cons of the Diet Plan:
          </legend>
          {consOptions.map((option) => (
            <label key={option} className="block">
              <input
                type="checkbox"
                value={option}
                checked={selectedCons.includes(option)}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCons((prev) =>
                    prev.includes(value)
                      ? prev.filter((con) => con !== value)
                      : [...prev, value]
                  );
                }}
              />
              {option}
            </label>
          ))}
          {selectedCons.includes("Other") && (
            <input
              type="text"
              placeholder="Enter your own con"
              value={customCon}
              onChange={handleCustomInputChange(
                customCon,
                setCustomCon,
                setConMessage
              )}
              className="border border-gray-300 p-2 w-full rounded mt-2"
            />
          )}
          {conMessage && <p className="text-red-500">{conMessage}</p>}
        </fieldset>
      </div>
      {/* Option to add additional summary */}
      <div className="flex flex-col gap-2 justify-center items-center">
        <div className="relative flex flex-col p-2 gap-2 rounded-lg w-full">
          <h2 className="text-center font-semibold">
            Any reflection on this diet experience?
          </h2>
          <textarea
            value={summaryInputValue}
            onChange={(e) => setSummaryInputValue(e.target.value)}
            placeholder="Type your summary here..."
            className="bg-purple-200 dark:bg-sky-200 text-stone-700 border-2 border-purple-300 dark:border-blue-300 p-2 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-blue-500"
            rows={3}
            autoFocus
          />
        </div>

        {/* Heart Rating Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-center font-semibold">Rate this experience?</h2>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((heart) => (
              <i
                key={heart}
                className={`fa-heart fa-solid fa-xl ${
                  rating >= heart ? "text-pink-400" : "text-stone-300"
                } cursor-pointer`}
                onClick={() => setRating(heart)}
              ></i>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="max-w-[400px] w-full mx-auto">
        <Button
          clickHandler={handleSubmit}
          text={loading ? "Submitting" : "Submit"}
          full
          dark
        />
      </div>
    </div>
  );
}