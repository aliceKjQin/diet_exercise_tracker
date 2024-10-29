"use client";

import DietPlanForm from "@/components/DietPlanForm";
import Main from "@/components/Main";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveDiet } from "@/hooks/useActiveDiet"; 
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import { db, storage } from "@/firebase";
import Link from "next/link";
import { deleteObject, ref } from "firebase/storage";

export default function HomePage() {
  const { user } = useAuth();
  const { activeDiet, loading } = useActiveDiet(user);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Function to handle diet removal
  const handleRemoveDiet = async () => {
    if (!user || !activeDiet) return;

    try {
      const userRef = doc(db, "users", user.uid);
      // Remove the diet data from Firestore
      await updateDoc(userRef, {
        [`diets.${activeDiet.name}`]: deleteField(), // Remove the diet
      });

      // Delete the initialBodyImage from Firebase Storage
      if (activeDiet.details.initialBodyImage) {
        const storageRef = ref(
          storage,
          `users/${user.uid}/diets/${activeDiet.name}/initialBodyImage.jpg`
        );
        await deleteObject(storageRef)
      }

      // Delete the currentBodyImage from Firebase Storage
      if (activeDiet.details.currentBodyImage) {
        const storageRef = ref(
          storage,
          `users/${user.uid}/diets/${activeDiet.name}/currentBodyImage.jpg`
        );
        await deleteObject(storageRef)
      }

      setShowConfirmation(false);
      setSuccessMessage("The diet was removed successfully!"); // Show success message

      // *** forcing a full page reload will ensure that the component rerenders properly and reflects the removal of the active diet. As router.push('/')doesn’t trigger a full rerender for the same route.
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error removing diet:", error);
      setErrorMessage("Failed to remove the diet. Please try again.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (activeDiet) {
    return (
      <Main>
        <div className="max-w-lg mx-auto mt-4 p-2 sm:text-xl flex flex-col gap-4">
          <h1>
            Current Active Diet:{" "}
            <span className="uppercase textGradient font-bold">
              {activeDiet.name}
            </span>
          </h1>
          <p>
            You started on{" "}
            <span className="textGradient">{activeDiet.details.startDate}</span>{" "}
            and still in progress.
          </p>
          <button className="bg-emerald-400 text-white font-bold py-2 px-4 rounded ">
            <Link href={`/dashboard/${activeDiet.name}`}>
              View Active Diet Dashboard
            </Link>
          </button>

          <p className="mt-8 sm:mt-12">
            To start a new diet, please remove the current active one.
          </p>

          <button
            onClick={() => setShowConfirmation(true)}
            className="bg-red-400 text-white font-bold py-2 px-4 rounded "
          >
            Remove Active Diet
          </button>

          {showConfirmation && (
            <ConfirmModal
              onConfirm={() => {
                handleRemoveDiet();
                setErrorMessage(null);
              }}
              onCancel={() => {
                setShowConfirmation(false);
                setErrorMessage(null);
              }}
            />
          )}
          {/* section to display success and error message if exits */}
          {successMessage && (
            <p className="max-w-lg mx-auto mt-4 p-2 sm:text-xl bg-green-100 text-green-800 rounded-md">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p className="max-w-lg mx-auto mt-4 p-2 sm:text-xl bg-red-100 text-red-800 rounded-md">
              {errorMessage}
            </p>
          )}
        </div>
      </Main>
    );
  }
  // Return diet plan form if no active diet exists.
  return (
    <Main>
      <DietPlanForm />
    </Main>
  );
}
