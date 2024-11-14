"use client";

import DietPlanForm from "@/components/DietPlanForm";
import Main from "@/components/Main";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteDiet } from "@/hooks/useDeleteDiet";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import { db } from "@/firebase";
import Link from "next/link";
import { useWeightUnit } from "@/contexts/WeightUnitContext";

export default function HomePage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRemoveActiveDiet, setShowRemoveActiveDiet] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [duration, setDuration] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const { user, activeDiet, setActiveDiet, refetchActiveDiet, loading } =
    useAuth();
  const { deleteDiet } = useDeleteDiet();
  const { weightUnit } = useWeightUnit();

  useEffect(() => {
    if (activeDiet) {
      setDuration(activeDiet.details?.targetDays || "");
      setTargetWeight(activeDiet.details?.targetWeight || "");
    }
  }, [activeDiet]);

  //  Handle show remove active diet section
  const handleShowRemoveActive = () => {
    setShowRemoveActiveDiet(!showRemoveActiveDiet);
  };

  // Handle show instruction for new users
  const handleShowInstruction = () => {
    setShowInstruction(!showInstruction);
  };

  // Handle duration input change
  const handleDurationChange = (e) => {
    const inputValue = e.target.value;
    // Allow only whole numbers and empty string; *** Ensure input type is "text" not "number", as it won't trigger regex check
    if (!/^\d*$/.test(inputValue)) {
      setErrorMessage("Please enter a valid whole number.");
      return;
    }

    setErrorMessage("");
    setDuration(inputValue ? Number(inputValue) : ""); // Empty string allow user for deletion
  };

  // Handle targetWeight input change
  const handleTargetWeightChange = (e) => {
    const inputValue = e.target.value;

    if (!/^\d*$/.test(inputValue)) {
      setErrorMessage("Please enter a valid whole number.");
      return;
    }

    setErrorMessage("");
    setTargetWeight(inputValue ? Number(inputValue) : "");
  };

  // Save updated input in db
  const saveNewInput = async (fieldName, fieldValue) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const field = fieldName === "duration" ? "targetDays" : "targetWeight";
      await updateDoc(userRef, {
        [`diets.${activeDiet.name}.${field}`]: fieldValue,
      });

      // After saving, refetch the active diet
      await refetchActiveDiet(); // This will update the activeDiet in the context

      console.log(`Save updated ${field}!`);
    } catch (error) {
      console.error("Failed to save ${field}: ", error);
      setErrorMessage(`Failed to save ${filed}. Please try again.`);
    }
  };

  // Function to handle diet removal
  const handleRemoveDiet = async () => {
    const success = deleteDiet(user.uid, activeDiet.name);

    if (success) {
      setShowConfirmation(false);
      setActiveDiet(null);
    } else {
      setErrorMessage("Failed to delete diet. Please try again.");
    }
  };

  if (loading) return <Loading />;

  return (
    <Main>
      {/* conditionally render diet plan form */}
      {activeDiet ? (
        <div className="max-w-lg mx-auto mt-4 p-2 flex flex-col gap-4 ">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <h1 className="text-lg">
              <span className="font-bold">Current Active Diet:</span>{" "}
              <span className="uppercase textGradient dark:text-blue-500 font-bold">
                {activeDiet.name}
              </span>
            </h1>
            <button
              onClick={handleShowInstruction}
              className="font-semibold sm:text-sm text-xs text-stone-400"
            >
              New here?
            </button>
          </div>

          {/* Instruction section for new user */}
          {showInstruction && (
            <div className="flex flex-col gap-2 p-2 bg-indigo-50 ring-2 ring-indigo-300 rounded-md">
              <h3 className="font-bold text-center">Quick Start Guide</h3>

              <p>
                <strong>Dashboard:</strong> Log exercise and diet, and add
                optional notes to record daily observations.
              </p>
              <p>
                <strong>Pantry:</strong> Analyze nutrition of items in your
                pantry or a recipe. Access this feature in the Dashboard by
                clicking <em>"View Pantry"</em>.
              </p>
              <p>
                <strong>Progress:</strong> Track your progress with data
                visualizations, and upload body images to document your
                transformation. Access this feature in the Dashboard by clicking{" "}
                <em>"View Progress"</em>.
              </p>
              <p>
                <strong>History:</strong> Review past diet plans and their
                details.
              </p>
            </div>
          )}

          <p>
            You started on{" "}
            <span className="textGradient dark:text-blue-500">
              {activeDiet.details.startDate}
            </span>{" "}
            and still in progress.
          </p>

          {/* Update duration (targetDays) and targetWeight */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <label className="block mb-1 font-semibold" htmlFor="duration">
                Duration (days)
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={handleDurationChange}
                  placeholder="Enter a number"
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={() => saveNewInput("duration", duration)}
                  className="bg-purple-400 dark:bg-blue-400 text-white px-3 py-1 rounded font-bold"
                >
                  Update
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="block mb-1 font-semibold"
                htmlFor="targetWeight"
              >
                Target Weight ({weightUnit})
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="targetWeight"
                  value={targetWeight}
                  onChange={handleTargetWeightChange}
                  placeholder="Enter a number"
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={() => saveNewInput("targetWeight", targetWeight)}
                  className="bg-purple-400 dark:bg-blue-400 text-white px-3 py-1 rounded font-bold"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}

          <button className="bg-emerald-400 text-white font-bold py-2 px-4 rounded ">
            <Link href={`/dashboard/${activeDiet.name}`}>
              View Active Diet Dashboard
            </Link>
          </button>

          <button
            onClick={handleShowRemoveActive}
            className="font-semibold sm:text-sm text-xs text-stone-400"
          >
            Want to start a new diet?
          </button>

          {/* Remove active diet section */}
          {showRemoveActiveDiet ? (
            <>
              <p>
                To start a new diet, please remove the current active one, as
                you can have only one active diet at a time.
              </p>

              <button
                onClick={() => setShowConfirmation(true)}
                className="bg-red-400 text-white font-bold py-2 px-4 rounded "
              >
                Remove Active Diet
              </button>
              {/* Remove active diet confirmation */}
              {showConfirmation && (
                <ConfirmModal
                  onConfirm={() => {
                    handleRemoveDiet();
                    setErrorMessage("");
                  }}
                  onCancel={() => {
                    setShowConfirmation(false);
                  }}
                />
              )}
              {/* section to display error message if exits */}
              {errorMessage && (
                <p className="text-red-500 text-center">{errorMessage}</p>
              )}
            </>
          ) : (
            ""
          )}
        </div>
      ) : (
        <DietPlanForm />
      )}
    </Main>
  );
}
