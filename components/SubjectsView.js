"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import Loading from "./Loading";
import Login from "./Login";
import ProgressBar from "./ProgressBar";
import { Roboto } from "next/font/google";
import { useSubjects } from "@/hooks/useSubjects";
import Button from "./Button";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function SubjectsView() {
  const { currentUser, userDataObj, loading } = useAuth();
  const { subjects, subjectsProgress, deleteSubject, selectSubject } = useSubjects();

  if (loading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Login />;
  }
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {subjects.map((subjectName) => (
        <div key={subjectName} className="flex flex-col gap-2 sm:gap-4">
          <h4
            onClick={() => selectSubject(subjectName)}
            className={`text-lg sm:text-xl mb-1 textGradient uppercase ${roboto.className} cursor-pointer`}
          >
            {subjectName}
          </h4>
          <ProgressBar
            progressPercentage={
              subjectsProgress[subjectName]?.progressPercentage
            }
          />
          <div className="flex justify-between">
            <p>Target Hours: {userDataObj?.subjects[subjectName]?.targetHours}</p>
            <Button
              text="Delete"
              clickHandler={() => deleteSubject(subjectName)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
