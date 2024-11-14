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
import Link from "next/link";
import ReasonModal from "./ReasonModal";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Dashboard() {
  const { user, userDataObj, setUserDataObj, loading } = useAuth();
  const { activeDiet, loading: activeDietLoading } = useActiveDiet(user); 
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedDayNote, setSelectedDayNote] = useState(null);
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [activeDietData, setActiveDietData] = useState({});
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState("");
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  // fetch updated dietData from the activeDiet when page reload or redirect to dashboard, so calendar can show the updated diet data in the cells;
  useEffect(() => {
    if (activeDiet) {
      setActiveDietData(activeDiet.details.dietData);
    }
  }, [activeDiet]);

  const currentDayData = activeDietData?.[year]?.[month]?.[day];

  const handleTooltipToggle = () => {
    setIsTooltipVisible(!isTooltipVisible);
  };

  const handleShowWarning = () => {
    setShowWarning(!showWarning);
  };

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

      // Update userDataObj with the new diet data
      const updatedDietPlan = {
        ...userDataObj.diets[activeDiet.name], // Use activeDiet.name here
        dietData: newDietData,
      };
      // update global state
      setUserDataObj({
        ...userDataObj,
        diets: {
          ...userDataObj.diets,
          [activeDiet.name]: updatedDietPlan,
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

  console.log("ActiveDietData on Dashboard page: ", activeDietData);

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
      className={`p-4 px-5 rounded-2xl purpleShadow duration:200 bg-indigo-400 text-center flex flex-col gap-2 flex-1 items-center`}
    >
      <p className="text-4xl sm:text-5xl md:text-6xl">{emoji}</p>
      <p
        className={`text-white text-xs sm:text-sm md:text-base ${roboto.className}`}
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

  if (loading || activeDietLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
    <div className="flex gap-4">
      <div className="flex mb-4 font-bold">
        <Link href={`/pantry`}>
          View Pantry{" "}
          <i className="fa-solid fa-basket-shopping textGradient dark:text-blue-500"></i>
        </Link>
      </div>
      <div className="flex mb-4 font-bold">
        <Link href={`/progress/${activeDiet.name}`}>
          View Progress{" "}
          <i className="fa-solid fa-arrow-trend-up textGradient dark:text-blue-500"></i>
        </Link>
      </div>
    </div>
      
      <div className="flex flex-col flex-1 gap-4 sm:gap-6">
        <h3 className="text-lg sm:text-xl text-center font-bold">
          Today&apos;s Activities
        </h3>

        {/* info icon with tooltip */}
        <div className="relative flex flex-col items-center sm:text-xl textGradient dark:text-blue-500">
          <i
            className="fa-solid fa-circle-info cursor-pointer"
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            onClick={handleTooltipToggle} // For mobile, tap to toggle
          ></i>

          {/* Tooltip content */}
          {isTooltipVisible && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 w-60 sm:w-80 bg-stone-700 text-white ring-2 ring-yellow-200 text-xs sm:text-sm rounded shadow-lg z-10">
              <i className="fa-solid fa-face-smile text-green-300"></i> Good day: completed both exercise and diet.
              <br />
              <i className="fa-solid fa-face-meh text-yellow-300"></i> Neutral: completed one activity.
              <br />
              <i className="fa-solid fa-face-frown text-red-300"></i> Missed: completed neither activity.
              <br />
              *** Click once to mark an activity as completed ✅, click again to
              mark as missed ❌.
              <br />
              <i className="fa-solid fa-pen-to-square text-white"></i> Add Note: record observations.
            </div>
          )}
        </div>

        {showWarning ? (
          <p className="p-2 bg-yellow-50 rounded-lg ring-2 ring-rose-200 text-center mx-auto">
            <i
              className="fa-solid fa-triangle-exclamation fa-lg  text-rose-500 cursor-pointer"
              onClick={handleShowWarning}
            ></i>{" "}
            <span className="text-sm text-stone-700">
              Make sure to log both diet and exercise to display the matching
              emoji face
            </span>
          </p>
        ) : (
          <i
            className="fa-solid fa-triangle-exclamation fa-lg text-rose-500 cursor-pointer text-center"
            onClick={handleShowWarning}
          ></i>
        )}

        <div className="flex items-stretch flex-wrap gap-4 text-white">
          {/* Exercise & Diet Buttons */}
          {renderButton(
            (<i className="fa-solid fa-dumbbell"></i>),
            "Exercise",
            currentDayData?.exercise,
            () => handleToggle("exercise"),
            "emerald-400"
          )}
          {renderButton(
            (<i className="fa-solid fa-bowl-rice"></i>),
            "Diet",
            currentDayData?.diet,
            () => handleToggle("diet"),
            "emerald-400"
          )}

          {/* Note Button  */}
          {renderNoteButton((<i className="fa-solid fa-pen-to-square text-white"></i>), hasNote, () => setShowNoteModal(true))}
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
      </div>
    </>
  );
}
