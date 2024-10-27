import React, { useMemo } from "react";

export default function ProgressBar({ targetDays, dietData }) {
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

  // Other useful stats
  const daysLeft = targetDays - totalLoggedDays;

  return (
    <>
      <p className="textGradient dark:text-blue-500 font-bold uppercase">
      <i className="fa-regular fa-calendar"></i> {daysLeft} days left
      </p>
      {/* progress bar */}
      <div className="w-full h-10 sm:h-12 bg-gray-300 mb-4 sm:mb-6">
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
        {/* Position emojis based on percentage */}
        <div className="relative w-full h-0 text-lg sm:text-2xl">
          {happyPercentage > 0 && (
            <span
              className="absolute"
              style={{ left: `0%` }} // Start of happy section
            >
              😀
            </span>
          )}
          {neutralPercentage > 0 && (
            <span
              className="absolute"
              style={{ left: `${happyPercentage}%` }} // start of the neutral section which is the end of happyPercentage
            >
              😐
            </span>
          )}
          {sadPercentage > 0 && (
            <span // If there is a sad percentage, then show
              className="absolute"
              style={{ left: `${happyPercentage + neutralPercentage}%` }} // start of the sad section
            >
              ☹️
            </span>
          )}
        </div>
      </div>
    </>
  );
}
