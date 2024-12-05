"use client";

import React, { useState } from "react";
import { useInactiveDiet } from "@/app/history/useInactiveDiet";
import { useDeleteDiet } from "@/app/history/useDeleteDiet";
import { useAuth } from "@/contexts/AuthContext";
import Main from "@/components/shared/Main";
import Button from "@/components/shared/Button";
import Loading from "@/components/shared/Loading";
import Link from "next/link";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function HistoryPage() {
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, activeDiet } = useAuth();
  const {
    inactiveDiets,
    setInactiveDiets,
    loading: loadingInactiveDiets,
  } = useInactiveDiet(user);
  const { deleteDiet } = useDeleteDiet();

  const handleDeleteDiet = async (dietName) => {
    setLoading(true);
    const success = await deleteDiet(user.uid, dietName);
    if (success) {
      setInactiveDiets((prevDiets) =>
        prevDiets.filter((diet) => diet.name !== dietName)
      );
      setSuccess(`Deleted ${dietName}`);
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } else {
      console.error("Failed to delete diet: ", error);
      setErrorMessage("Failed to delete diet, please try again.");
    }
    setSelectedDiet(null); // Close delete confirm modal after delete attempt
    setLoading(false);
  };

  if (loadingInactiveDiets) return <Loading />;

  return (
    <Main>
      {/* div for dietName and delete button */}
      {inactiveDiets.length > 0 ? (
        <div className="flex flex-col">
          {/* loading, success, error state section */}
          {loading && <Loading />}
          {success && (
            <p className="p-2 text-center text-emerald-500 transition duration-200">
              {success} <i className="fa-regular fa-square-check  fa-xl"></i>
            </p>
          )}
          {errorMessage && (
            <p className="text-center text-red-500">
              {errorMessage} <i class="fa-regular fa-circle-xmark fa-xl"></i>
            </p>
          )}

          <div className=" flex flex-col gap-4 sm:gap-8 sm:text-xl">
            {/* archived list */}
            {inactiveDiets.map((diet, index) => {
              const dietName = diet.name;
              const dietDetails = diet.details;
              const startDate = diet.details.startDate;
              const completeDate = dietDetails.completeDate;
              const rating = dietDetails.rating;
              console.log("Diet data: ", diet);
              return (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex gap-4 items-center textGradient dark:text-blue-500">
                    <Link href={`/history/${dietName}`}>
                      <h3 className="capitalize font-semibold">{dietName}</h3>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedDiet(dietName);
                      }}
                    >
                      <i className="fa-regular fa-square-minus text-stone-300"></i>
                    </button>
                  </div>
                  {/* startDate & completeData & heart rating */}
                  <div className="flex gap-6 items-center justify-between">
                    <p>
                      {startDate} - {completeDate}
                    </p>
                    {/* heart rating */}
                    <div className="flex gap-1 sm:gap-2">
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
                        handleDeleteDiet(dietName);
                        setErrorMessage("");
                      }}
                      onCancel={() => setSelectedDiet(null)}
                    />
                  )}
                </div>
              );
            })}
            {/* Create diet plan button */}
            {!activeDiet && (
              <Link href={"/"} className="mt-4">
                <Button text="Create New Diet Plan" full dark />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold">
            You don&apos;t have any complete diet record.
          </p>
          <Link href={"/"}>
            <Button text="Create Your Diet Plan" full dark/>
          </Link>
        </div>
      )}
    </Main>
  );
}
