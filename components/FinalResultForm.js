"use client";

import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Button from "./Button";
import { useAuth } from "@/contexts/AuthContext";

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
  const { setActiveDiet, activeDiet } = useAuth();
  const maxWords = 6;

  const prosOptions = [
    "Increased energy",
    "Improved mood",
    "Weight loss",
    "Healthier eating habits",
    "Other",
  ];

  const consOptions = [
    "Hunger pangs",
    "Difficult to maintain",
    "Social eating challenges",
    "Limited food choices",
    "Other",
  ];

  // Set finalWeight to currentWeight in db so if user didn't enter a value it will be default to the existing currentWeight instead of overwriting it with 0.
  useEffect(() => {
    if (activeDiet) {
      setFinalWeight(activeDiet.details.currentWeight || "");
    }
  }, [activeDiet]);

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
      currentWeight: Number(finalWeight),
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
      onSubmissionSuccess();
    } catch (err) {
      console.error("Error submitting results: ", err);
      setError("Failed to submit results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center ">
      <h2 className="text-xl font-bold">Submit Your Final Results</h2>

      {error && <p className="text-red-400">{error}</p>}

      {/* Final Weight Input */}
      <div className="flex flex-col items-center">
        <label
          htmlFor="finalWeight"
          className="block textGradient dark:text-blue-500 text-sm sm:text-base font-bold mb-2"
        >
          Final Weight (kg)
        </label>
        <input
          type="number"
          id="finalWeight"
          value={finalWeight}
          onChange={(e) => setFinalWeight(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded"
          required
        />
      </div>
      {/* Div for pros and cons */}
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Pros Selection */}
        <fieldset>
          <legend className="block textGradient dark:text-blue-500 text-base sm:text-lg font-bold">
            Pros of the Diet Plan:
          </legend>
          {prosOptions.map((option) => (
            <label key={option} className="block w-[300px]">
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
        <fieldset>
          <legend className="block textGradient dark:text-blue-500 text-base sm:text-lg font-bold">
            Cons of the Diet Plan:
          </legend>
          {consOptions.map((option) => (
            <label key={option} className="block w-[300px]">
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
      <div className="relative flex flex-col p-4 gap-4 rounded-lg w-full">
        <h2 className="text-base sm:text-lg text-center font-bold textGradient dark:text-blue-500">
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

      {/* Star Rating Section */}
      <h2 className="text-base sm:text-lg text-center font-bold textGradient dark:text-blue-500">
        Rate this experience?
      </h2>
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fa-star fa-solid fa-xl ${
              rating >= star ? "text-yellow-400" : "text-stone-300"
            } cursor-pointer`}
            onClick={() => setRating(star)}
          ></i>
        ))}
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
