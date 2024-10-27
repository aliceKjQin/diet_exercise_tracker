"use client";

import { useEffect, useState } from "react";
import { subDays, format } from "date-fns";

// Utility to calculate past week's dates
const getPastWeekDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = subDays(new Date(), i);
    dates.push({
      year: format(date, "yyyy"),
      month: format(date, "M"),
      day: format(date, "d"),
    });
  }
  return dates;
};

export default function useProgressData(activeDiet) {
  const [data, setData] = useState({
    dietReasons: {},
    exerciseReasons: {},
    dietMissedPercentages: {},
    exerciseMissedPercentages: {},
    missedDays: 0,
    dietMissedDays: 0,
    exerciseMissedDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeDiet || !activeDiet.details?.dietData) return;

      setLoading(true);
      try {
        // Step 1: Get the past week's date range
        const pastWeekDates = getPastWeekDates();
        const dietData = activeDiet.details.dietData;

        // Step 2: Initialize counters for missed reasons and days
        const dietMissedReasons = {};
        const exerciseMissedReasons = {};
        let missedDays = 0;
        let dietMissedDays = 0;
        let exerciseMissedDays = 0;

        // Step 3: Loop through each date in the past week and aggregate data
        pastWeekDates.forEach(({ year, month, day }) => {
          console.log("Year, Month, Day: ", { year, month, day }); // destructure obj { year, month, day } to extract the values associated with those keys 

          // Convert year, month, and day to numbers
          const numericYear = Number(year); // "2024" -> 2024
          const numericMonth = Number(month)-1; // "10" -> 10
          const numericDay = Number(day);

          console.log("Numeric values for Y, M, D: ", numericYear, numericMonth, numericDay)

          const dayData =
            dietData?.[numericYear]?.[numericMonth]?.[numericDay];
          console.log("DayData: ", dayData);
          console.log("DietData[numericYear]: ", dietData[numericYear])
          console.log("DietData for Year and Month: ", dietData[numericYear][numericMonth]);
          console.log("dietData: ", dietData)
          if (dayData) {
            // Diet missed reason processing
            if (dayData.diet === false && dayData.dietMissedReason) {
              dietMissedReasons[dayData.dietMissedReason] =
                (dietMissedReasons[dayData.dietMissedReason] || 0) + 1; // Check if a specific missed reason already has a count. If yes, adds 1 to the existing count, else it initializes the count to 1.
              dietMissedDays++;
            }

            // Exercise missed reason processing
            if (dayData.exercise === false && dayData.exerciseMissedReason) {
              exerciseMissedReasons[dayData.exerciseMissedReason] =
                (exerciseMissedReasons[dayData.exerciseMissedReason] || 0) + 1;
              exerciseMissedDays++;
            }

            // Counting missed days
            if (dayData.diet === false || dayData.exercise === false) {
              missedDays++;
            }
          }
        });

        // Step 4: Calculate missed percentages for each reason
        const dietMissedPercentages = {};
        const exerciseMissedPercentages = {};

        Object.entries(dietMissedReasons).forEach(([reason, count]) => {
          dietMissedPercentages[reason] =
            ((count / dietMissedDays) * 100).toFixed(2) || 0;
        });

        Object.entries(exerciseMissedReasons).forEach(([reason, count]) => {
          exerciseMissedPercentages[reason] =
            ((count / exerciseMissedDays) * 100).toFixed(2) || 0;
        });

        // Step 5: Set the processed data
        setData({
          dietReasons: dietMissedReasons,
          exerciseReasons: exerciseMissedReasons,
          missedDays,
          dietMissedDays,
          exerciseMissedDays,
          dietMissedPercentages,
          exerciseMissedPercentages,
        });
      } catch (error) {
        console.error("Error processing progress data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeDiet]);

  return { data, loading };
}
