import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

// Register necessary components
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title);

const MissedDaysChart = ({
  dietMissedDays,
  exerciseMissedDays,
  targetDays,
}) => {
  const chartData = {
    labels: ["Diet", "Exercise"],
    datasets: [
      {
        label: ["Missed Days"],
        data: [dietMissedDays, exerciseMissedDays],
        borderWidth: 1,
        backgroundColor: ["#7cf3a0", "#b4f8c8"], // Custom colors for bars
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Total Missed Days per Diet & Exercise",
      },
      legend: {
        display: false
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        max: targetDays, // Setting max y to targetDays
      },
    },
  };

  return (
    <div className="flex mx-auto">
      <div className="w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MissedDaysChart;
