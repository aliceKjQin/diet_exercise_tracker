"use client";

import { Roboto } from "next/font/google";
import React, { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/shared/Loading";
import Login from "@/app/login/Login";
import { db } from "@/firebase";
import NoteModal from "@/app/dashboard/NoteModal";
import Button from "@/components/shared/Button";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import ReasonModal from "@/app/dashboard/ReasonModal";
import TooltipNwarning from "./TooltipNwarning";
import DashboardPopup from "./DashboardPopup";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Dashboard() {
  const { user, activeDiet, loading: loadingUser, setActiveDiet } = useAuth();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedDayNote, setSelectedDayNote] = useState(null);
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [dietData, setDietData] = useState({});
  const [dietName, setDietName] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState("");

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Fetch dietData (display face, note icon in calendar if available)
  useEffect(() => {
    if (activeDiet) {
      setDietData(activeDiet.details?.dietData);
      setDietName(activeDiet.name);
    }
  }, [activeDiet]);

  const currentDayData = dietData?.[year]?.[month]?.[day] || {};

  const handleSetData = async (updatedValues) => {
    try {
      const newDietData = { ...dietData };

      // Initialize the nested structure if it doesn't exist
      if (!newDietData[year]) {
        newDietData[year] = {};
      }
      if (!newDietData[year]?.[month]) {
        newDietData[year][month] = {};
      }

      const existingDayData = newDietData[year]?.[month]?.[day] || {};
      newDietData[year][month][day] = {
        ...existingDayData,
        ...updatedValues,
      };
      // Update local state
      setDietData(newDietData);

      // Update db
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          diets: {
            [dietName]: {
              dietData: newDietData,
            },
          },
        },
        { merge: true }
      );

      // Update global state
      setActiveDiet((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          dietData: newDietData,
        },
      }));
    } catch (err) {
      console.error(`Failed to update data: ${err.message}`);
    }
  };

  // Handle toggle boolean for exercise and diet
  const handleToggle = (type) => {
    const currentValue = currentDayData?.[type];

    if (currentValue === undefined) {
      console.log("Logging: New entry as true");
      handleSetData({ [type]: true });
    } else if (currentValue === true) {
      console.log("Logging: Toggling to false");
      handleSetData({ [type]: false });
      setReasonType(type);
      setShowReasonModal(true);
    } else if (currentValue === false) {
      console.log("Logging: Toggling back to true");
      handleSetData({ [type]: true, [`${type}MissedReason`]: null });
    }
  };

  const handleReasonSave = (reason) => {
    const type = reasonType; // Type is diet or exercise
    handleSetData({ [type]: false, [`${type}MissedReason`]: reason }); // Save the reason to db
    setShowReasonModal(false); // Close the modal
  };

  const handleReasonCancel = () => {
    // Reset diet/exercise to true when users click Cancel in ReasonModal
    handleSetData({ [reasonType]: true }); // Reset the activity to true
    setShowReasonModal(false); // Close the modal
  };

  const handleSetNote = (note) => {
    handleSetData({ note });
  };

  const hasNote = currentDayData?.note;

  // Function to render button for note
  const renderNoteButton = (emoji, hasNote, onClick) => (
    <button
      onClick={onClick}
      aria-label="note-button"
      className={`p-4 px-1 rounded-2xl purpleShadow duration:200 bg-stone-100 text-center flex flex-col gap-2 flex-1 items-center`}
    >
      <p className="text-4xl sm:text-5xl md:text-6xl">{emoji}</p>
      <p
        className={`text-stone-700 text-xs sm:text-sm md:text-base ${roboto.className}`}
      >
        {hasNote ? "Update Note" : "Add Note"}
      </p>
    </button>
  );

  // Function to render button for diet and exercise
  const renderButton = (emoji, label, currentValue, onClick, color) => {
    return (
      <button
        onClick={onClick}
        className={`p-4 px-5 rounded-2xl purpleShadow duration:200 bg-${color} text-center flex flex-col gap-2 flex-1 items-center`}
        aria-label={label === "Diet" ? "diet-button" : "exercise-button"}
      >
        {currentValue === undefined ? (
          <>
            {/* Render only the label if currentValue is undefined */}
            <p className="text-4xl sm:text-5xl md:text-6xl">{emoji}</p>
            <p
              className={`text-stone-700 text-xs sm:text-sm md:text-base ${roboto.className}`}
            >
              {label}
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl sm:text-5xl md:text-6xl">{emoji}</p>
            <p
              className={`text-stone-700 text-xs sm:text-sm md:text-base ${roboto.className}`}
            >
              {currentValue ? `${label} ✅` : `${label} ❌`}
            </p>
          </>
        )}
      </button>
    );
  };

  // The note here is the selected day's note passed from calendar
  const onNoteClick = (note) => {
    setSelectedDayNote(note);
    setIsNoteVisible(true);
  };

  const toggleNoteVisibility = () => {
    setIsNoteVisible(!isNoteVisible);
  };

  if (loadingUser) return <Loading />;

  if (!user) {
    return <Login />; // show login when users log out
  }

  return (
    <>
      <div className="flex gap-4 mb-6 justify-center sm:justify-start">
        <Link href={`/pantry`}>
          <Button
            text={
              <>
                <i className="fa-solid fa-basket-shopping"></i> View Pantry
              </>
            }
            dark
          ></Button>
        </Link>

        <Link href={`/progress`}>
          <Button
            text={
              <>
                <i className="fa-solid fa-arrow-trend-up "></i> View Progress
              </>
            }
            dark
          />
        </Link>
      </div>

      <div className="flex flex-col flex-1 gap-4 sm:gap-6">
        <h3 className="text-lg sm:text-xl text-center font-bold">
          Today&apos;s Activities
        </h3>

        <TooltipNwarning />

        <div className="flex items-stretch flex-wrap gap-4 text-white">
          {/* Exercise & Diet Buttons */}
          {renderButton(
            <i className="fa-solid fa-bowl-rice"></i>,
            "Diet",
            currentDayData?.diet,
            () => handleToggle("diet"),
            "emerald-400"
          )}
          {renderButton(
            <i className="fa-solid fa-dumbbell"></i>,
            "Exercise",
            currentDayData?.exercise,
            () => handleToggle("exercise"),
            "emerald-400"
          )}

          {/* Note Button  */}
          {renderNoteButton(
            <i className="fa-solid fa-pen-to-square text-stone-400"></i>,
            hasNote,
            () => setShowNoteModal(true)
          )}
        </div>

        {/* Display note modal to add note */}
        {showNoteModal && (
          <NoteModal
            onSave={(note) => {
              handleSetNote(note);
              setShowNoteModal(false);
            }}
            onClose={() => setShowNoteModal(false)}
            initialNote={currentDayData?.note || ""}
          />
        )}

        {/* Display the selected note when user clicks the note icon in calendar */}
        {selectedDayNote && isNoteVisible && (
          <div className="relative flex flex-col bg-purple-200 dark:bg-sky-200 text-stone-600 p-4 gap-4 rounded-lg">
            <p>{selectedDayNote}</p>
            <div className="flex justify-end mt-auto">
              <Button clickHandler={toggleNoteVisibility} text="Close" dark />
            </div>
          </div>
        )}

        {/* Display reasonModal when user logged exercise or diet as false */}
        {showReasonModal && (
          <ReasonModal
            type={reasonType}
            onSave={handleReasonSave}
            onClose={handleReasonCancel}
          />
        )}

        <Calendar dietData={dietData} onNoteClick={onNoteClick} />

        {/* Display a popup when users visit the dashboard page first time during the day to remind users to log diet and exercise */}
        <DashboardPopup
          day={day}
          month={month}
          year={year}
          dietName={dietName}
        />
      </div>
    </>
  );
}
