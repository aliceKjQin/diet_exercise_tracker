"use client";

import { useEffect, useState } from "react";

export default function useProgressData(diet) {
  const [data, setData] = useState({
    dietReasons: {},
    exerciseReasons: {},
    dietMissedPercentages: {},
    exerciseMissedPercentages: {},
    topDietMissedPercentages: {},
    topExerciseMissedPercentages: {},
    totalMissedDays: 0,
    totalDietMissedDays: 0,
    totalExerciseMissedDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!diet || !diet.details?.dietData) return;

      setLoading(true);
      try {
        const dietData = diet.details.dietData;

        // Initialize counters for missed reasons and days
        const totalDietMissedReasons = {};
        const totalExerciseMissedReasons = {};
        let totalMissedDays = 0;
        let totalDietMissedDays = 0;
        let totalExerciseMissedDays = 0;

        // Traverse entire `dietData`
        for (const year in dietData) {
          for (const month in dietData[year]) {
            for (const day in dietData[year][month]) {
              const dayData = dietData[year][month][day];

              // Diet missed reason processing
              if (dayData.diet === false && dayData.dietMissedReason) {
                totalDietMissedReasons[dayData.dietMissedReason] =
                  (totalDietMissedReasons[dayData.dietMissedReason] || 0) + 1;
                totalDietMissedDays++;
              }

              // Exercise missed reason processing
              if (dayData.exercise === false && dayData.exerciseMissedReason) {
                totalExerciseMissedReasons[dayData.exerciseMissedReason] =
                  (totalExerciseMissedReasons[dayData.exerciseMissedReason] ||
                    0) + 1;
                totalExerciseMissedDays++;
              }

              // Counting missed days
              if (dayData.diet === false || dayData.exercise === false) {
                totalMissedDays++;
              }
            }
          }
        }

        // Calculate missed percentages for each reason of all logged days
        const dietMissedPercentages = {};
        const exerciseMissedPercentages = {};

        Object.entries(totalDietMissedReasons).forEach(([reason, count]) => {
          dietMissedPercentages[reason] =
            ((count / totalDietMissedDays) * 100).toFixed(2) || 0;
        });

        Object.entries(totalExerciseMissedReasons).forEach(([reason, count]) => {
          exerciseMissedPercentages[reason] =
            ((count / totalExerciseMissedDays) * 100).toFixed(2) || 0;
        });

        // Sort and extract top 3 missed reasons for all logged days
        const topDietMissedPercentages = Object.entries(totalDietMissedReasons)
          .sort((a, b) => b[1] - a[1]) // Sort by count
          .slice(0, 3) // Keep top 3
          .reduce((acc, [reason, count]) => {
            acc[reason] = ((count / totalDietMissedDays) * 100).toFixed(2);
            return acc;
          }, {});

        const topExerciseMissedPercentages = Object.entries(
          totalExerciseMissedReasons
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .reduce((acc, [reason, count]) => {
            acc[reason] = ((count / totalExerciseMissedDays) * 100).toFixed(2);
            return acc;
          }, {});

        // Set the processed data
        setData({
          totalMissedDays,
          totalDietMissedDays,
          totalExerciseMissedDays,
          dietMissedPercentages,
          exerciseMissedPercentages,
          topDietMissedPercentages,
          topExerciseMissedPercentages,
          totalDietMissedDays,
          totalExerciseMissedDays,
        });
      } catch (error) {
        console.error("Error processing progress data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [diet]);

  return { data, loading };
}
