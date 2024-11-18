"use client";

import useProgressData from "@/hooks/useProgressData";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import MissedReasonsChart from "./MissedReasonsChart";
import MissedDaysChart from "./MissedDaysChart";
import MissedActivityChart from "./MissedActivityChart";

export default function MainProgressCharts({
  diet,
  targetDays,
  dietData,
  dietName,
  isActive,
}) {
  const { data } = useProgressData(diet);
  const [showPie, setShowPie] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Handle show tooltip
  const handleShowTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  // Handle show pie chart
  const handleShowPie = () => {
    setShowPie(!showPie);
  };

  // Helper to determine face type
  const getFaceType = (dayData) => {
    if (dayData?.diet && dayData?.exercise) {
      return "😀";
    } else if (dayData?.diet === false && dayData?.exercise === false) {
      return "☹️";
    } else if (
      (dayData?.diet && !dayData?.exercise) ||
      (!dayData?.diet && dayData?.exercise)
    ) {
      return "😐";
    }
    return null;
  };

  // Compute the logged days and the face types
  const loggedData = useMemo(() => {
    const facesCount = { happy: 0, neutral: 0, sad: 0 };

    // Check if dietData is defined and valid
    if (!dietData || typeof dietData !== "object") {
      return {
        facesCount,
        progress: 0,
        totalLoggedDays: 0,
      };
    }

    Object.keys(dietData).forEach((year) => {
      Object.keys(dietData[year]).forEach((month) => {
        Object.keys(dietData[year][month]).forEach((day) => {
          const dayData = dietData[year][month][day];
          const face = getFaceType(dayData);
          if (face === "😀") facesCount.happy++;
          if (face === "😐") facesCount.neutral++;
          if (face === "☹️") facesCount.sad++;
        });
      });
    });

    const totalLoggedDays =
      facesCount.happy + facesCount.neutral + facesCount.sad;
    const progress = Math.min((totalLoggedDays / targetDays) * 100, 100); // Overall progress
    return {
      facesCount,
      progress,
      totalLoggedDays,
    };
  }, [dietData, targetDays]);

  // Calculate the width percentages for each type of face
  const { facesCount, progress, totalLoggedDays } = loggedData;
  const happyPercentage = (facesCount.happy / totalLoggedDays) * progress;
  const neutralPercentage = (facesCount.neutral / totalLoggedDays) * progress;
  const sadPercentage = (facesCount.sad / totalLoggedDays) * progress;

  // Calculate neutral + sad face data for Missed Activity Doughnut
  const sadNeutralData = {
    "Completed one activity ": facesCount.neutral,
    "Completed neither activity": facesCount.sad,
  };

  // Other useful stats
  const daysLeft = targetDays - totalLoggedDays;

  return (
    <div className="flex flex-col gap-4 bg-indigo-400 p-4 text-white w-full rounded-lg">
      {/* Display daysLeft for active diet, display diet duration if inactive */}
      {isActive ? (
        <h2 className="font-bold">
          <i className="fa-regular fa-calendar mr-2"></i>{daysLeft} Days Left |
          Target: {targetDays} (D)
        </h2>
      ) : (
        <p className="font-bold">Duration: {targetDays} Days</p>
      )}

      {/* Duration progress bar with face emojis */}
      <div className="w-full h-8 sm:h-12 bg-stone-200 mb-8 sm:mb-10">
        <div className="relative w-full h-full flex">
          <div
            className="bg-green-400 h-full"
            style={{ width: `${happyPercentage}%` }}
          ></div>
          <div
            className="bg-yellow-400 h-full"
            style={{ width: `${neutralPercentage}%` }}
          ></div>
          <div
            className="bg-red-400 h-full"
            style={{ width: `${sadPercentage}%` }}
          ></div>
        </div>
        {/* Position emoji faces based on percentage */}
        {targetDays <= 10 ? (
          <div className="relative w-full h-0 text-xs sm:text-lg">
            {happyPercentage > 0 && (
              <span
                className="absolute"
                style={{ left: `0%` }} // Start of happy section
              >
                <i className="fa-solid fa-face-smile text-green-300"></i>
                <span className="ml-1">{facesCount.happy}D</span>
              </span>
            )}
            {neutralPercentage > 0 && (
              <span
                className="absolute"
                style={{ left: `${happyPercentage}%` }} // start of the neutral section which is the end of happyPercentage
              >
                <i className="fa-solid fa-face-meh text-yellow-300"></i>
                <span className="ml-1">{facesCount.neutral}D</span>
              </span>
            )}
            {sadPercentage > 0 && (
              <span // If there is a sad percentage, then show
                className="absolute"
                style={{ left: `${happyPercentage + neutralPercentage}%` }} // start of the sad section
              >
                <i className="fa-solid fa-face-frown text-red-300"></i>
                <span className="ml-1">{facesCount.sad}D</span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-4 justify-center text-sm sm:text-lg mt-1">
            <div>
              <i className="fa-solid fa-face-smile text-green-300"></i>{" "}
              <span className="bg-green-400 px-1.5 sm:px-2 mr-1"></span>
              <span className="text-sm">{facesCount.happy}D</span>
            </div>
            <div>
              <i className="fa-solid fa-face-meh text-yellow-300"></i>{" "}
              <span className="bg-yellow-400 px-1.5 sm:px-2 mr-1"></span>
              <span className="text-sm">{facesCount.neutral}D</span>
            </div>
            <div>
              <i className="fa-solid fa-face-frown text-red-300"></i>{" "}
              <span className="bg-red-400 px-1.5 sm:px-2 mr-1"></span>
              <span className="text-sm">{facesCount.sad}D</span>
            </div>
          </div>
        )}
      </div>

      {/* Neutral & Sad Face Stack Bar */}

      {(facesCount.neutral > 0 || facesCount.sad > 0) && (
        <>
          {/* stack bar title with Tooltip */}
          <div
            className="flex flex-col"
            onClick={handleShowTooltip} // For mobile, tap to toggle
          >
            <h2 className="text-center font-bold text-xs sm:text-sm mt-3">
              Missed Activity Days Breakdown per{" "}
              <i className="fa-solid fa-face-meh fa-lg text-yellow-300"></i> &{" "}
              <i className="fa-solid fa-face-frown fa-lg text-red-300"></i>{" "}
            </h2>

            {/* info icon with tooltip */}
            <div className="relative flex flex-col items-center mt-1">
              <i
                className="fa-regular fa-circle-question text-white cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              ></i>

              {/* Tooltip content */}
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 w-80 bg-indigo-500 text-white ring-2 ring-pink-400 text-sm rounded shadow-lg z-10">
                  <i className="fa-solid fa-face-meh text-yellow-300"></i> = ✅
                  ❌ = completed one activity.
                  <br />
                  <i className="fa-solid fa-face-frown text-red-300"></i> = ❌
                  ❌ = completed neither activity.
                </div>
              )}
            </div>
          </div>

          {/* Missed Activity Days | Stack Bar Chart */}
          <MissedActivityChart
            neutralFaceCount={facesCount.neutral}
            sadFaceCount={facesCount.sad}
            targetDays={targetDays}
          />
        </>
      )}

      {/* Check Missed Reasons Button & Charts */}
      <div className="flex flex-col gap-2 mt-2">
        {/* Check Missed Reasons Button */}
        {(facesCount.neutral > 0 || facesCount.sad > 0) && (
          <button
            onClick={handleShowPie}
            className="p-2 ring-2 ring-pink-200 rounded-full font-semibold text-xs sm:text-sm"
          >
            {showPie
              ? "Hide Charts"
              : "Wonder why you missed your diet or exercise?"}
          </button>
        )}

        {/* Missed reasons pie & bar chart */}
        {showPie && (
          <div className="flex flex-col gap-4">
            <MissedReasonsChart
              dietMissedData={data.dietMissedPercentages || {}}
              exerciseMissedData={data.exerciseMissedPercentages || {}}
              isActive
            />

            {/* Total Missed Days Per Diet and Exercise Bar Chart */}
            <MissedDaysChart
              dietMissedDays={data.totalDietMissedDays}
              exerciseMissedDays={data.totalExerciseMissedDays}
              targetDays={targetDays}
            />
          </div>
        )}
      </div>

      {/* Show popup when daysLeft <= 0 */}
      {daysLeft <= 0 && isActive && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          aria-describedby="popup-description"
        >
          <div className="bg-indigo-500 text-white p-6 rounded-lg shadow-lg w-96 text-center ring-2 ring-lime-300">
            <h2 id="popup-title" className="text-lg font-bold mb-4 capitalize">
              {`${dietName} Diet Complete!`}
            </h2>
            <p id="popup-description" className="mb-4 gap-2">
              <Link
                href={`/complete/${dietName}`}
                className="text-lime-300 font-bold"
              >
                Go enter your final result{" "}
                <i className="fa-regular fa-flag"></i>
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
