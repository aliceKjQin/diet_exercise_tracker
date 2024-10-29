"use client";

import React from "react";
import { useInactiveDiet } from "@/hooks/useInactiveDiet";
import { useAuth } from "@/contexts/AuthContext";
import Main from "@/components/Main";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import Link from "next/link";

export default function HistoryPage() {
  const { user } = useAuth();
  const { inactiveDiets, loading } = useInactiveDiet(user);

  if (loading) return <Loading />;

  return (
    <Main>
      {inactiveDiets.length > 0 ? (
        <div className=" flex flex-col gap-4">
          <p>Archived List</p>
          {inactiveDiets.map((diet) => {
            const dietName = diet.name;
            const dietDetails = diet.details;
            const startDate = diet.details.startDate
            const completeDate = dietDetails.completeDate
            console.log("Diet data: ", diet);
            return (
              <div key={startDate} className="flex flex-col gap-4">
                <div className="flex gap-6">
                  <h3 className="uppercase">{dietName}</h3>
                  <p>
                    {startDate} - {completeDate}
                  </p>
                </div>
              </div>
            );
          })}
          {/* Create diet plan button */}
          <Link href={"/"} className="text-center mt-4">
            <Button text="Create New Diet Plan" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold">
            You don't have any complete diet record, start one today?
          </p>
          <Link href={"/"}>
            <Button text="Create Diet Plan" />
          </Link>
        </div>
      )}
    </Main>
  );
}
