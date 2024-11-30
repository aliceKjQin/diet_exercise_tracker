import React, { useState } from "react";
import { useDeleteDiet } from "@/app/history/useDeleteDiet";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function RemoveDiet({ dietName }) {
  const [showRemoveActiveDiet, setShowRemoveActiveDiet] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { setActiveDiet, user } = useAuth();
  const { deleteDiet } = useDeleteDiet();

  //  Handle show remove active diet section
  const handleShowRemoveActive = () => {
    setShowRemoveActiveDiet(!showRemoveActiveDiet);
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

  return (
    <>
      <button
        onClick={handleShowRemoveActive}
        className="font-semibold sm:text-sm text-xs text-stone-400 mx-auto mt-6 ring-1 ring-stone-300 p-2 rounded-full"
      >
        {showRemoveActiveDiet
          ? "Hide Remove Diet"
          : "Want to start a new diet?"}
      </button>

      {showRemoveActiveDiet ? (
        <>
          <p>
            To start a new diet, please remove the current active one, as you
            can have only one active diet at a time.
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
    </>
  );
}
