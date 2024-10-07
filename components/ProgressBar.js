import React from "react";

export default function ProgressBar({ progressPercentage }) {

  const clampedPercentage = Math.min(progressPercentage, 100); // "clamp" the passed value to 100 as the maximum, to ensure the progress bar never exceeds 100% width

  return (
    <div className="w-full bg-gray-200 rounded-full h-6 sm:h-10 md:h-14  dark:bg-gray-700">
      <div
        className="bg-purple-400 h-6 sm:h-10 md:h-14 rounded-full"
        style={{ width: `${clampedPercentage}%` }}
      ></div>
    </div>
  );
}
