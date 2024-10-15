"use client";

import { Roboto } from "next/font/google";
import React, { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "./Loading";
import Login from "./Login";
import { db } from "@/firebase";
import NoteModal from "./NoteModal";
import Button from "./Button";
import { doc, setDoc } from "firebase/firestore";
import { useActiveDiet } from "@/hooks/useActiveDiet"; // Import the hook

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Dashboard() {
  const { user, userDataObj, setUserDataObj, loading } = useAuth();
  const { activeDiet, loading: activeDietLoading } = useActiveDiet(user); // Use the active diet hook
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  // fetch the latest data and set the initial state of exercise and diet log based on this data, on reload 
  useEffect(() => {
    if (activeDiet) {
      const currentDayData = activeDiet.details.dietData?.[year]?.[month]?.[day] || {};
      const completeDate = activeDiet.details.dietData
      setIsExerciseLogged(currentDayData.exercise || false); // Sets to false if undefined
      setIsDietLogged(currentDayData.diet || false); // Sets to false if undefined
    }
  }, [activeDiet, year, month, day]);

  const hasExercise =
    activeDiet?.details?.dietData?.[year]?.[month]?.[day]?.exercise === true;
  const hasDiet =
    activeDiet?.details?.dietData?.[year]?.[month]?.[day]?.diet === true;
  const hasNote = activeDiet?.details?.dietData?.[year]?.[month]?.[day]?.note;

  const [isExerciseLogged, setIsExerciseLogged] = useState(hasExercise);
  const [isDietLogged, setIsDietLogged] = useState(hasDiet);

  const handleSetData = async (updatedValues) => {
    try {
      // Create a copy of the active diet for updates
      const newDietData = { ...activeDiet.details.dietData };

      // Initialize the nested structure if it doesn't exist
      if (!newDietData[year]) {
        newDietData[year] = {};
      }
      if (!newDietData[year][month]) {
        newDietData[year][month] = {};
      }

      const existingDayData = newDietData[year][month][day] || {};
      newDietData[year][month][day] = {
        ...existingDayData,
        ...updatedValues,
      };

      // Update userDataObj with the new diet data
      const updatedDiet = {
        ...userDataObj.diets[activeDiet.name], // Use activeDiet.name here
        dietData: newDietData,
      };

      setUserDataObj({
        ...userDataObj,
        diets: {
          ...userDataObj.diets,
          [activeDiet.name]: updatedDiet,
        },
      });

      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          diets: {
            [activeDiet.name]: {
              dietData: newDietData,
            },
          },
        },
        { merge: true }
      );

    } catch (err) {
      console.error(`Failed to update data: ${err.message}`);
    }
  };

  const handleSetExercise = () => {
    const newExerciseState = !isExerciseLogged; // Toggle state
    setIsExerciseLogged(newExerciseState); // Update local state
    handleSetData({ exercise: newExerciseState }); // Update Firestore
  };

  const handleSetDiet = () => {
    const newDietState = !isDietLogged; // Toggle state
    setIsDietLogged(newDietState); // Update local state
    handleSetData({ diet: newDietState }); // Update Firestore

  };

  const handleSetNote = (note) => {
    handleSetData({ note });
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setIsNoteVisible(true);
  };

  const toggleNoteVisibility = () => {
    setIsNoteVisible(!isNoteVisible);
  };

  if (loading || activeDietLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex flex-col flex-1 gap-8 sm:gap-12 md:gap-16">
      <h4
        className={
          "text-5xl sm:text-6xl md:text-7xl text-center " + roboto.className
        }
      >
        Today's Activities
      </h4>
      <div className="flex items-stretch flex-wrap gap-4">
        {/* Exercise Button */}
        <button
          onClick={handleSetExercise}
          className={`p-4 px-5 rounded-2xl purpleShadow duration:200 bg-teal-400 hover:bg-purple-100 text-center flex flex-col gap-2 flex-1`}
        >
          <p className="text-4xl sm:text-5xl md:text-6xl">🏋️</p>
          <p
            className={`text-stone-600 text-xs sm:text-sm md:text-base ${roboto.className}`}
          >
            {isExerciseLogged ? "Exercise Logged" : "Log Exercise"}
          </p>
        </button>

        {/* Diet Button */}
        <button
          onClick={handleSetDiet}
          className={`p-4 px-5 rounded-2xl purpleShadow duration:200 bg-red-400 hover:bg-purple-100 text-center flex flex-col gap-2 flex-1`}
        >
          <p className="text-4xl sm:text-5xl md:text-6xl">🍽️</p>
          <p
            className={`text-stone-600 text-xs sm:text-sm md:text-base ${roboto.className}`}
          >
            {isDietLogged ? "Diet Logged" : "Log Diet"}
          </p>
        </button>

        {/* Note Button */}
        <button
          onClick={() => setShowNoteModal(true)}
          className={`p-4 px-5 rounded-2xl purpleShadow duration:200 bg-yellow-400 hover:bg-purple-100 text-center flex flex-col gap-2 flex-1`}
        >
          <p className="text-4xl sm:text-5xl md:text-6xl">📝</p>
          <p
            className={`text-stone-600 text-xs sm:text-sm md:text-base ${roboto.className}`}
          >
            {hasNote ? "Note Added" : "Add Note"}
          </p>
        </button>
      </div>

      {/* Note modal to add optional note */}
      {showNoteModal && (
        <NoteModal
          onSave={(note) => {
            handleSetNote(note);
            setShowNoteModal(false);
          }}
          onClose={() => setShowNoteModal(false)}
        />
      )}

      {/* display the note when user clicks the note emoji */}
      {selectedNote && isNoteVisible && (
        <div className="relative flex flex-col bg-purple-50 text-purple-500 p-4 gap-4 rounded-lg">
          <p>{selectedNote}</p>
          <div className="flex justify-end mt-auto">
            <Button clickHandler={toggleNoteVisibility} text="Close" dark />
          </div>
        </div>
      )}

      <Calendar
        completeData={activeDiet.details.dietData}
        onNoteClick={handleNoteClick}
      />
    </div>
  );
}
