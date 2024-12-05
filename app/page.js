"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import UpdateInputButton from "@/components/shared/UpdateInputButton";
import Loading from "@/components/shared/Loading";
import DietPlanForm from "@/app/DietPlanForm";
import Main from "@/components/shared/Main";
import Instruction from "@/app/Instruction";
import RemoveDiet from "@/app/RemoveDiet";
import Image from "next/image";
import Button from "@/components/shared/Button";

export default function HomePage() {
  const [showInstruction, setShowInstruction] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [targetDays, setTargetDays] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [dietName, setDietName] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    user,
    activeDiet,
    refetchActiveDiet,
    loading: loadingUser,
  } = useAuth();
  const { weightUnit } = useWeightUnit();

  useEffect(() => {
    // Show preview if user is unauthorized
    if (!user) {
      setShowPreview(true);
    }
  }, [user]);

  useEffect(() => {
    if (!activeDiet) return;
    if (activeDiet) {
      setTargetDays(activeDiet.details?.targetDays || "");
      setTargetWeight(activeDiet.details?.targetWeight || "");
      setDietName(activeDiet.name);
    }
  }, [activeDiet]);

  // Handle show instruction for new users
  const handleShowInstruction = () => {
    setShowInstruction(!showInstruction);
  };

  // Handle input change (higher-order function: returns another function)
  const handleInputChange = (setter) => (e) => {
    const inputValue = e.target.value;
    // Allow only whole numbers and empty string; *** Ensure input type is "text" not "number", as it won't trigger regex check
    if (!/^\d*$/.test(inputValue)) {
      setErrorMessage("Please enter a valid whole number.");
      return;
    }

    setErrorMessage("");
    setter(inputValue ? Number(inputValue) : ""); // Empty string allow user for deletion
  };

  // Save updated input in db
  const saveNewInput = async (fieldName, fieldValue) => {
    // Check any unclear error before submission
    if (errorMessage) {
      setErrorMessage(errorMessage);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`diets.${activeDiet.name}.${fieldName}`]: fieldValue,
      });

      // After saving, refetch the active diet
      await refetchActiveDiet(); // This will update the activeDiet in the context
      setSuccessMessage(`Saved new ${fieldName}!`);
      // Clear the success message after 2 seconds
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Failed to save ${field}: ", error);
      setErrorMessage(`Failed to save ${fieldName}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePreview = () => setShowPreview(false);

  if (loadingUser) return <Loading />;

  return (
    <Main>
      {/* Modal for unauthorized users */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg mx-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
              Explore Diet & Exercise Tracker
            </h2>
            <p className="mb-4 text-center">
              Swipe through the images to explore features of the app!
            </p>
            {/* Horizontal scroll container */}
            <div className="flex overflow-x-auto gap-4 pb-4">
              {[
                "/images/demo_dashboard.png",
                "/images/demo_progress.png",
                "/images/demo_chart.png",
                "/images/demo_notes.png",
                "/images/demo_pantry.png",
                "/images/demo_recipe.png",
                "/images/demo_nutrition.png",
              ].map((src, index) => (
                <div
                  key={index}
                  className="relative w-[70%] sm:w-1/2 flex-none mx-auto"
                >
                  {/* improve preview modal images loading experience with next/image to avoid the inconsistency where the modal grows suddenly when images load. Use image placeholder as lazy loading which helps ensure the images are displayed smoothly, with a placeholder showing until the actual image is fully loaded */}
                  <Image
                    src={src}
                    alt={`Preview ${index + 1}`}
                    width={300} // base width for larger screens
                    height={500} // base height for larger screens
                    layout="responsive"
                    className="rounded-3xl object-cover border-4 border-lime-200"
                    placeholder="blur"
                    blurDataURL="/images/blur_placeholder.png" // A small blurred version of the image
                    priority={index === 0} // Optional: prioritizes the first image for faster load
                  />
                </div>
              ))}
            </div>
            <Button text="Close" clickHandler={handleClosePreview} full dark />
          </div>
        </div>
      )}

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
          {showInstruction && <Instruction />}

          {/* Diet info */}
          <p className="text-center">
            You started on{" "}
            <span className="textGradient dark:text-blue-500">
              {activeDiet.details.startDate}
            </span>{" "}
            and still in progress.
          </p>

          {/* Update Field for duration (targetDays) and targetWeight */}
          <div className="mx-auto mb-4">
            <div className="flex flex-col gap-2 mb-4">
              <label className="block mb-1 " htmlFor="targetDays">
                Duration (days)
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="targetDays"
                  value={targetDays}
                  onChange={handleInputChange(setTargetDays)} // call handleInputChange(outer function) immediately and it returns the inner arrow function (e) => { ... } which will execute when onChange event fires
                  className="p-2 rounded-full outline-none"
                />

                <UpdateInputButton
                  onClick={() => saveNewInput("targetDays", targetDays)}
                  className="bg-white hover:bg-indigo-500 hover:text-white border-2 border-solid border-indigo-400"
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
                  onChange={handleInputChange(setTargetWeight)}
                  className="p-2 rounded-full outline-none"
                />
                <UpdateInputButton
                  onClick={() => saveNewInput("targetWeight", targetWeight)}
                  className="bg-white hover:bg-indigo-500 hover:text-white border-2 border-solid border-indigo-400"
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
          ><Button text="View Dashboard" dark full/>
          </Link>

          {/* Remove active diet section */}
          <RemoveDiet dietName={dietName} />
        </div>
      ) : (
        <DietPlanForm />
      )}
    </Main>
  );
}
