"use client";

import DietPlanForm from "@/components/DietPlanForm";
import Main from "@/components/Main";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteDiet } from "@/hooks/useDeleteDiet";
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import { db, storage } from "@/firebase";
import Link from "next/link";
import { deleteObject, ref } from "firebase/storage";

export default function HomePage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { user, activeDiet, setActiveDiet, loading } = useAuth();
  const { deleteDiet } = useDeleteDiet()

  // Function to handle diet removal
  const handleRemoveDiet = async () => {
    const success = deleteDiet(user.uid, activeDiet.name)
    if (success) {
      setShowConfirmation(false);
      setActiveDiet(null)
    }
  }

  if (loading) return <Loading />

    return (
      <Main>
        {/* conditionally render diet plan form */}
        {activeDiet ? (<div className="max-w-lg mx-auto mt-4 p-2 sm:text-xl flex flex-col gap-4">
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
          {errorMessage && (
            <p className="max-w-lg mx-auto mt-4 p-2 sm:text-xl bg-red-100 text-red-800 rounded-md">
              {errorMessage}
            </p>
          )}
        </div>) : (<DietPlanForm />)}
      </Main>
    );

}
