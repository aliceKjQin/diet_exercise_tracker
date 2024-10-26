import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, Colors, Title } from "chart.js";

// Register necessary components
Chart.register(ArcElement, Tooltip, Legend, Colors, Title);

export default function MissedReasonsChart({
  dietMissedData = {}, // Default to an empty object if undefined
  exerciseMissedData = {},
}) {
  const dietLabels = Object.keys(dietMissedData);
  const dietPercentages = Object.values(dietMissedData);
  console.log("DietMissedData:", dietMissedData);

  const exerciseLabels = Object.keys(exerciseMissedData);
  const exercisePercentages = Object.values(exerciseMissedData);
  console.log("ExerciseMissedData:", exerciseMissedData);

  const dietChartData = {
    labels: dietLabels,
    datasets: [
      {
        label: "Missed by %",
        data: dietPercentages,
      },
    ],
  };

  const exerciseChartData = {
    labels: exerciseLabels,
    datasets: [
      {
        label: "Missed by %",
        data: exercisePercentages,
      },
    ],
  };

  // Individual options for each chart with distinct titles
  const dietChartOptions = {
    plugins: {
      title: {
        display: true,
        text: "Diet Missed Reasons",
      },
      legend: {
        position: "bottom",
      },
    },
    
  };

  const exerciseChartOptions = {
    plugins: {
      title: {
        display: true,
        text: "Exercise Missed Reasons",
      },
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="flex flex-col sm:flex-row gap-12 justify-center w-full items-center">
      <div className="w-[300px]">
        <Pie data={dietChartData} options={dietChartOptions} />
      </div>
      <div className="w-[300px]">
        <Pie data={exerciseChartData} options={exerciseChartOptions} />
      </div>
    </div>
  );
}
