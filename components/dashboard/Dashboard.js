"use client";

import { Roboto } from "next/font/google";
import React, { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/sharedUI/Loading";
import Login from "@/components/core/Login";
import { db } from "@/firebase";
import NoteModal from "@/components/dashboard/NoteModal";
import Button from "@/components/sharedUI/Button";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import ReasonModal from "@/components/dashboard/ReasonModal";
import TooltipNwarning from "./TooltipNwarning";
import DashboardPopup from "./DashboardPopup";


const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Dashboard() {
  const {
    user,
    userDataObj,
    setUserDataObj,
    activeDiet,
    refetchActiveDiet,
    loading: loadingUser,
  } = useAuth();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedDayNote, setSelectedDayNote] = useState(null);
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [activeDietData, setActiveDietData] = useState({});
  const [dietName, setDietName] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState("");

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Fetch dietData (show face emojis, note in calendar)
  useEffect(() => {
    if (activeDiet) {
      setActiveDietData(activeDiet.details?.dietData);
      setDietName(activeDiet.name);
    }
  }, [activeDiet]);

  const currentDayData = activeDietData?.[year]?.[month]?.[day];

  const handleSetData = async (updatedValues) => {
    try {
      const newDietData = { ...activeDietData };

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
      // Update local state
      setActiveDietData(newDietData);

      // update global state: userDataObj with the new diet data
      const updatedDietPlan = {
        ...userDataObj.diets[dietName],
        dietData: newDietData,
      };

      setUserDataObj({
        ...userDataObj,
        diets: {
          ...userDataObj.diets,
          [dietName]: updatedDietPlan,
        },
      });

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
      await refetchActiveDiet(); // refetch activeDiet after saving to update the global activeDiet context
    } catch (err) {
      console.error(`Failed to update data: ${err.message}`);
    }
  };

  // handle toggle and handle set exercise and diet
  const handleToggle = (type) => {
    const currentValue = currentDayData?.[type];
    const missedReasonExists = currentDayData?.[`${type}MissedReason`];

    if (currentValue === undefined) {
      handleSetData({ [type]: true }); // Log as completed without a modal
    }
    // Case 2: If it's already logged as completed (true), toggle it off directly
    else if (currentValue === true) {
      handleSetData({ [type]: false }); // Toggle it off (i.e., marking as missed)
      setReasonType(type);
      setShowReasonModal(true);
    }
    // Case 3: If it's logged as missed (false), open the modal for a reason OR toggle it back to true
    else if (currentValue === false) {
      // handle toggling back to true directly if clicked again
      if (missedReasonExists) {
        // Toggle back to true when clicking on a missed entry
        handleSetData({ [type]: true, [`${type}MissedReason`]: null }); // Remove the missed reason
      } else {
        // If there's no missed reason, open the modal
        setReasonType(type);
        setShowReasonModal(true);
      }
    }
  };

  const handleReasonSave = (reason) => {
    const type = reasonType; // The type stored in the state when user logged as false
    handleSetData({ [type]: false, [`${type}MissedReason`]: reason }); // Save the reason to db
    setShowReasonModal(false); // close the modal
  };

  const handleReasonCancel = () => {
    // Reset to true since the user canceled
    handleSetData({ [reasonType]: true }); // Reset the activity to true
    setShowReasonModal(false); // Close the modal
  };

  const handleSetNote = (note) => {
    handleSetData({ note });
  };

  const hasNote = currentDayData?.note;

  // Render button for note
  const renderNoteButton = (emoji, hasNote, onClick) => (
    <button
      onClick={onClick}
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

  // renderButton for Exercise and Diet
  const renderButton = (emoji, label, currentValue, onClick, color) => {
    return (
      <button
        onClick={onClick}
        className={`p-4 px-5 rounded-2xl purpleShadow duration:200 bg-${color} text-center flex flex-col gap-2 flex-1 items-center`}
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

  // the note here is the selected day's note passed from calendar
  const onNoteClick = (note) => {
    setSelectedDayNote(note);
    setIsNoteVisible(true);
  };

  const toggleNoteVisibility = () => {
    setIsNoteVisible(!isNoteVisible);
  };

  if (loadingUser) return <Loading />;

  if (!user) {
    return <Login />; // show login when users logged out
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

        <Link href={`/progress/${activeDiet?.name}`}>
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

        {/* Note modal to add optional note */}
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

        {/* display the note when user clicks the note emoji from calendar */}
        {selectedDayNote && isNoteVisible && (
          <div className="relative flex flex-col bg-purple-200 dark:bg-sky-200 text-stone-600 p-4 gap-4 rounded-lg">
            <p>{selectedDayNote}</p>
            <div className="flex justify-end mt-auto">
              <Button clickHandler={toggleNoteVisibility} text="Close" dark />
            </div>
          </div>
        )}

        {/* display reasonModal when user logged exercise or diet as false */}
        {showReasonModal && (
          <ReasonModal
            type={reasonType}
            onSave={handleReasonSave}
            onClose={handleReasonCancel}
          />
        )}

        <Calendar completeData={activeDietData} onNoteClick={onNoteClick} />

        <DashboardPopup day={day} month={month} year={year}  dietName={dietName}/>

      </div>
    </>
  );
}
