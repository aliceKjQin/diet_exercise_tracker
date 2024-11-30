"use client";

import React, { useState } from "react";

export default function GeneralGuideline() {
  const [showGuideline, setShowGuideline] = useState(false);

  const handleShowGuideline = () => {
    setShowGuideline(!showGuideline);
  };
  return (
    <>
      <button
        className="font-semibold sm:text-sm text-xs text-gray-400 mb-2 ml-auto"
        onClick={handleShowGuideline}
      >
        {showGuideline ? "Close General Guideline" : "Check General Guideline"}
      </button>

      {showGuideline && (
        <div className="flex flex-col gap-1 p-2 bg-indigo-50 ring-2 ring-indigo-300 rounded-md">
          <h3 className="text-center font-bold">General Guideline</h3>
          <h4 className="font-semibold text-indigo-500">Protein</h4>
          <p>
            <strong>General Recommendation:</strong> 0.8 grams per kilogram of
            body weight (minimum).
          </p>
          <p>
            <strong>Active Individuals:</strong> 1.2-2.0 grams per kilogram of
            body weight for athletes or those building muscle.
          </p>

          <h4 className="font-semibold text-indigo-500">Calories</h4>
          <p><strong>Women:</strong> ~2000 calories/day</p>
          <p><strong>Men:</strong> ~2500 calories/day</p>

          <p className="text-center">
            <em>Adjust accordingly to your activity level, goals and lifestyle.</em> 
          </p>
        </div>
      )}
    </>
  );
}
