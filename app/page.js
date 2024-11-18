"use client";

import DietPlanForm from "@/components/home/DietPlanForm";
import Main from "@/components/shared/Main";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteDiet } from "@/hooks/useDeleteDiet";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Loading from "@/components/shared/Loading";
import { db } from "@/firebase";
import Link from "next/link";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import UpdateInputButton from "@/components/shared/UpdateInputButton";

export default function HomePage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRemoveActiveDiet, setShowRemoveActiveDiet] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [duration, setDuration] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [dietName, setDietName] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    user,
    activeDiet,
    setActiveDiet,
    refetchActiveDiet,
    loading: loadingUser,
  } = useAuth();
  const { deleteDiet } = useDeleteDiet();
  const { weightUnit } = useWeightUnit();

  useEffect(() => {
    if (!user || !activeDiet) return;
    if (activeDiet) {
      setDuration(activeDiet.details?.targetDays || "");
      setTargetWeight(activeDiet.details?.targetWeight || "");
      setDietName(activeDiet.name);
    }
  }, [activeDiet, user]);

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
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const field = fieldName === "duration" ? "targetDays" : "targetWeight";
      await updateDoc(userRef, {
        [`diets.${activeDiet.name}.${field}`]: fieldValue,
      });

      // After saving, refetch the active diet
      await refetchActiveDiet(); // This will update the activeDiet in the context
      setSuccessMessage(`Saved new ${field}!`);
      // Clear the success message after 2 seconds
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Failed to save ${field}: ", error);
      setErrorMessage(`Failed to save ${field}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle diet removal
  const handleRemoveDiet = async () => {
    const success = deleteDiet(user.uid, dietName);

    if (success) {
      setShowConfirmation(false);
      setShowRemoveActiveDiet(false);
      setActiveDiet(null);
    } else {
      setErrorMessage("Failed to delete diet. Please try again.");
    }
  };

  if (loadingUser) return <Loading />;

  return (
    <Main>
      {/* conditionally render diet plan form */}
      {activeDiet ? (
        <div className="w-full mx-auto mt-4 p-2 flex flex-col gap-4 ">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <h1 className="text-lg">
              <span className="font-bold">Current Active Diet:</span>{" "}
              <p className="uppercase textGradient dark:text-blue-500 font-bold">
                {activeDiet.name}
              </p>
            </h1>
            <button
              onClick={handleShowInstruction}
              className="font-semibold sm:text-sm text-xs text-stone-400"
            >
              {showInstruction ? "Close Quick Start Guide" : "New here?"}
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
                clicking <em>&quot;View Pantry&quot;</em>.
              </p>
              <p>
                <strong>Progress:</strong> Track your progress with data
                visualizations, and upload body images to document your
                transformation. Access this feature in the Dashboard by clicking{" "}
                <em>&quot;View Progress&quot;</em>.
              </p>
              <p>
                <strong>History:</strong> Review past diet plans and their
                details.
              </p>
            </div>
          )}

          <p className="text-center">
            You started on{" "}
            <span className="textGradient dark:text-blue-500">
              {activeDiet.details.startDate}
            </span>{" "}
            and still in progress.
          </p>

          {/* Update duration (targetDays) and targetWeight */}
          <div className="mx-auto">
            <div className="flex flex-col gap-2 mb-4">
              <label className="block mb-1 " htmlFor="duration">
                Duration (days)
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={handleDurationChange}
                  placeholder="Enter a number"
                  className="p-2 border border-solid border-indigo-300 rounded-full outline-none"
                />

                <UpdateInputButton
                  onClick={() => saveNewInput("duration", duration)}
                  className="bg-indigo-400 hover:bg-indigo-300"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="block mb-1 " htmlFor="targetWeight">
                Target Weight ({weightUnit})
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="targetWeight"
                  value={targetWeight}
                  onChange={handleTargetWeightChange}
                  placeholder="Enter a number"
                  className="p-2 border border-solid border-indigo-300 rounded-full outline-none"
                />
                <UpdateInputButton
                  onClick={() => saveNewInput("targetWeight", targetWeight)}
                  className="bg-indigo-400 hover:bg-indigo-300"
                />
              </div>
            </div>
          </div>
          {/* loading, error, success status */}
          {loading && <Loading />}
          {errorMessage && (
            <p className="p-2 mt-4 text-red-500 text-center">
              {errorMessage} <i class="fa-regular fa-circle-xmark fa-lg"></i>
            </p>
          )}
          {successMessage && (
            <p className="p-2 mt-2 text-emerald-500 text-center transition duration-200">
              {successMessage}{" "}
              <i className="fa-regular fa-square-check  fa-lg"></i>
            </p>
          )}

          <Link
            href={`/dashboard/${dietName}`}
            className="bg-emerald-400 hover:bg-emerald-500 text-white font-bold text-lg text-center py-2 px-4 rounded-full mt-2"
          >
            View Dashboard
          </Link>

          <button
            onClick={handleShowRemoveActive}
            className="font-semibold sm:text-sm text-xs text-stone-400 mx-auto mt-6 ring-1 ring-stone-300 p-2 rounded-full"
          >
            {showRemoveActiveDiet
              ? "Hide Remove Diet"
              : "Want to start a new diet?"}
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
                className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full"
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
