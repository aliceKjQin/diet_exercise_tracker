"use client";

import React, { useState, useEffect } from "react";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

const months = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

const dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar(props) {
  const { completeData, onNoteClick } = props;

  const now = new Date();
  const currentMonth = now.getMonth(); // numerical number for the month from 0 - 11
  const monthsArr = Object.keys(months);
  const [selectedMonth, setSelectedMonth] = useState(monthsArr[currentMonth]);
  const numericMonth = monthsArr.indexOf(selectedMonth);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const data = completeData?.[selectedYear]?.[numericMonth];

  function handleIncrementAndDecrementMonth(val) {
    // val +1 -1
    // if we hit the bounds of the months, then we can just adjust the year that is displayed instead
    if (numericMonth + val < 0) {
      // set month value = 11 which is Dec and decrement the year
      setSelectedMonth(monthsArr[monthsArr.length - 1]);
      setSelectedYear((curr) => curr - 1);
    } else if (numericMonth + val > 11) {
      // set month numeric value = 0 which is Jan and increment the year
      setSelectedMonth(monthsArr[0]);
      setSelectedYear((curr) => curr + 1);
    } else {
      setSelectedMonth(monthsArr[numericMonth + val]);
    }
  }

  const handleToday = () => {
    setSelectedMonth(monthsArr[currentMonth]);
    setSelectedYear(now.getFullYear());
  };

  const monthNow = new Date(
    selectedYear,
    Object.keys(months).indexOf(selectedMonth),
    1
  ); // return first day of currently assigned month, which is July 1 of 2024
  const firstDayOfMonth = monthNow.getDay(); // calculates which day of the week July 1st falls on (e.g., 0 for Sunday, 1 for Monday).
  const daysInMonth = new Date(
    selectedYear,
    Object.keys(months).indexOf(selectedMonth) + 1,
    0
  ).getDate();

  const daysToDisplay = firstDayOfMonth + daysInMonth;
  const numRows = Math.floor(daysToDisplay / 7) + (daysToDisplay % 7 ? 1 : 0);
  return (
    //  backward and forward bar
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-5 gap-4">
        <button
          className="mr-auto text-purple-400 dark:text-blue-400 text-lg sm:text-xl duration-200 hover:opacity-60"
          onClick={() => handleIncrementAndDecrementMonth(-1)}
        >
          <i className="fa-solid fa-circle-chevron-left"></i>
        </button>
        {/* div containing the month, year, and "Today" button */}
        <div className="col-span-3 flex justify-center items-center">
          <p
            className={`text-center text-purple-400 dark:text-blue-400 whitespace-nowrap ${roboto.className}`}
          >
            {selectedMonth}, {selectedYear}
          </p>
          <button
            className={`ml-4 bg-purple-400 dark:bg-blue-400 text-white px-3  rounded-lg duration-200 hover:opacity-60 ${roboto.className}`}
            onClick={handleToday}
          >
            Today
          </button>
        </div>

        <button
          className="ml-auto text-purple-400 dark:text-blue-400 text-lg sm:text-xl duration-200 hover:opacity-60"
          onClick={() => handleIncrementAndDecrementMonth(1)}
        >
          <i className="fa-solid fa-circle-chevron-right"></i>
        </button>
      </div>
      {/* display day of week row (Sun-Sat) */}
      <div className="sm:py-6 md:py-10 grid grid-cols-7">
        {dayList.map((dayOfWeek, dayOfWeekIndex) => (
          <span
            key={dayOfWeekIndex}
            className={`text-center textGradient dark:text-blue-400  ${roboto.className}`}
          >
            {dayOfWeek}
          </span>
        ))}
      </div>
      {/* calendar */}
      <div className="flex flex-col overflow-hidden gap-1 py-4 ">
        {[...Array(numRows).keys()].map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="grid grid-cols-7">
              {dayList.map((dayOfWeek, dayOfWeekIndex) => {
                let dayIndex =
                  rowIndex * 7 + dayOfWeekIndex - (firstDayOfMonth - 1);

                // daysToDisplay: The number of days plus the offset for the starting weekday.
                // If dayIndex > daysInMonth, this means we've gone beyond the last day of the month, so no day should be displayed (dayDisplay = false).
                // For the first row (row === 0), days before firstDayOfMonth should not be displayed (they belong to the previous month), so dayDisplay = false.
                let dayDisplay =
                  dayIndex > daysInMonth
                    ? false
                    : row === 0 && dayOfWeekIndex < firstDayOfMonth
                    ? false
                    : true;

                let isToday = dayIndex === now.getDate();
                let isCurrentMonth = selectedMonth === monthsArr[currentMonth];
                let isCurrentYear = selectedYear === now.getFullYear();

                if (!dayDisplay) {
                  return (
                    <div
                      className="bg-purple-50 dark:bg-sky-50"
                      key={dayOfWeekIndex}
                    ></div>
                  );
                }

                return (
                  <div
                    key={dayOfWeekIndex}
                    style={{minHeight: "60px"}}
                    className={`text-xs sm:text-sm border border-solid p-1 sm:p-2 flex items-center gap-1 justify-between rounded-lg ${
                      isToday && isCurrentMonth && isCurrentYear
                        ? "border-yellow-400 border-dashed border-2"
                        : "border-purple-100 dark:border-blue-100"
                    } ${
                      data?.[dayIndex]
                        ? "text-white bg-purple-400 dark:bg-blue-400"
                        : "text-purple-400 dark:text-blue-400 bg-white"
                    } `}
                  >
                    <p>{dayIndex}</p>
                    {/* Div for emojis */}
                    <div className="flex flex-col sm:flex-row items-center text-xl sm:text-2xl md:text-4xl">
                      {/* display a smiley face if both diet and exercise are true */}
                      {data?.[dayIndex]?.diet && data?.[dayIndex]?.exercise ? (
                        <p>😀</p>
                      ) : (
                        ""
                      )}
                      {/* display a sad face if both diet and exercise are false */}
                      {data?.[dayIndex]?.diet === false &&
                      data[dayIndex]?.exercise === false ? (
                        <p>☹️</p>
                      ) : (
                        ""
                      )}
                      {/* display a meh face when only one of the two (diet or exercise) is true */}
                      {(data?.[dayIndex]?.diet &&
                        !data?.[dayIndex]?.exercise) ||
                      (!data?.[dayIndex]?.diet &&
                        data?.[dayIndex]?.exercise) ? (
                        <p>😐</p>
                      ) : (
                        ""
                      )}
                      {/* display a note emoji if note is true, when clicks the note emoji, it sends the selected day note back to parent, Dashboard */}
                      {data?.[dayIndex]?.note ? (
                        <p onClick={() => onNoteClick(data[dayIndex].note)} className="cursor-pointer" >📝</p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
