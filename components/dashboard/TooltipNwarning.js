import React, { useState } from 'react'

export default function TooltipNwarning() {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [showWarning, setShowWarning] = useState(true);

    const handleTooltipToggle = () => {
        setIsTooltipVisible(!isTooltipVisible);
      };
    
      const handleShowWarning = () => {
        setShowWarning(!showWarning);
      };
  return (
    <>
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
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 w-60 sm:w-80 bg-indigo-500 text-white ring-2 ring-pink-400 text-xs sm:text-sm rounded shadow-lg z-10">
              <i className="fa-solid fa-face-smile text-green-300"></i> Good
              day: completed both exercise and diet.
              <br />
              <i className="fa-solid fa-face-meh text-yellow-300"></i> Neutral:
              completed one activity.
              <br />
              <i className="fa-solid fa-face-frown text-red-300"></i> Missed:
              completed neither activity.
              <br />
              *** Click once to mark an activity as completed ✅, click again to
              mark as missed ❌.
              <br />
              <i className="fa-solid fa-pen-to-square text-white"></i> Add Note:
              record observations.
            </div>
          )}
        </div>
        
        {/* Warning to log both activities */}
        {showWarning ? (
          <button
            onClick={handleShowWarning}
            className="p-2 bg-yellow-50 rounded-lg ring-2 ring-rose-200 text-center mx-auto"
          >
            <i className="fa-solid fa-triangle-exclamation fa-lg  text-rose-500 "></i>{" "}
            <span className="text-sm text-stone-700">
              Make sure to log <strong>both</strong>{" "}
              <em className="text-emerald-500">diet</em> and{" "}
              <em className="text-emerald-500">exercise</em> to display the
              matching emoji face
            </span>
          </button>
        ) : (
          <i
            className="fa-solid fa-triangle-exclamation fa-lg text-rose-500 cursor-pointer text-center"
            onClick={handleShowWarning}
          ></i>
        )}
    </>
  )
}
