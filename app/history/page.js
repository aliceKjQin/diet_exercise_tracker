"use client";

import React, { useState } from "react";
import { useInactiveDiet } from "@/hooks/useInactiveDiet";
import { useDeleteDiet } from "@/hooks/useDeleteDiet";
import { useAuth } from "@/contexts/AuthContext";
import Main from "@/components/Main";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";

export default function HistoryPage() {
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [errorMessage, setErrorMessage] = useState("")
  const { user } = useAuth();
  const {
    inactiveDiets,
    setInactiveDiets,
    loading: loadingInactiveDiets,
  } = useInactiveDiet(user);
  const { deleteDiet } = useDeleteDiet();

  const handleDeleteDiet = async (dietName) => {
    const success = await deleteDiet(user.uid, dietName);
    if (success) {
      setInactiveDiets((prevDiets) =>
        prevDiets.filter((diet) => diet.name !== dietName)
      ) 
    } else {
      setErrorMessage("Failed to delete diet, please try again.")
    }
    setSelectedDiet(null); // Close delete confirm modal after delete attempt
  };

  if (loadingInactiveDiets) return <Loading />;

  return (
    <Main>
      {inactiveDiets.length > 0 ? (
        <div className=" flex flex-col gap-4 sm:gap-8 sm:text-xl">
          {/* archived list */}
          {inactiveDiets.map((diet) => {
            const dietName = diet.name;
            const dietDetails = diet.details;
            const startDate = diet.details.startDate;
            const completeDate = dietDetails.completeDate;
            const rating = dietDetails.rating;
            console.log("Diet data: ", diet);
            return (
              <div key={startDate} className="flex flex-col gap-2">
                {/* div for dietName and delete button */}
                <div className="flex gap-4 items-center textGradient dark:text-blue-500">
                  <Link href={`/history/${dietName}`}>
                    <h3 className="capitalize font-semibold">{dietName}</h3>
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedDiet(dietName)
                    }}
                  >
                    <i className="fa-regular fa-square-minus"></i>
                  </button>
                </div>
                {/* startDate & completeData & heart rating */}
                <div className="flex gap-6 items-center justify-between">
                  <p>
                    {startDate} - {completeDate}
                  </p>
                  {/* heart rating */}
                  <div className="flex sm:gap-2">
                    {[1, 2, 3, 4, 5].map((heart) => (
                      <i
                        key={heart}
                        className={`fa-heart fa-solid ${
                          rating >= heart ? "text-pink-400" : "text-stone-300"
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
                 {/* Show confirmation modal only for the selected diet */}
                {selectedDiet === dietName && (
                  <ConfirmModal
                    onConfirm={() => {
                      handleDeleteDiet(dietName)
                      setErrorMessage("")
                    }}
                    onCancel={() => setSelectedDiet(null)}
                  />
                )}
                {/* section to display error message if exits */}
                {errorMessage && (
                  <p className="max-w-lg mx-auto mt-4 p-2 sm:text-xl bg-red-100 text-red-800 rounded-md">
                    {errorMessage}
                  </p>
                )}
              </div>
            );
          })}
          {/* Create diet plan button */}
          <Link href={"/"} className="mt-4">
            <Button text="Create New Diet Plan" full />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold">You don&apos;t have any complete diet record.</p>
          <Link href={"/"}>
            <Button text="Create Diet Plan" />
          </Link>
        </div>
      )}
    </Main>
  );
}
