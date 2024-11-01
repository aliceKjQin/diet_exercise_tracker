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

const MissedDaysChart = ({ dietMissedDays, exerciseMissedDays, isActive }) => {
  const chartData = {
    labels: ["Diet", "Exercise"],
    datasets: [
      {
        label: "Missed Days",
        data: [dietMissedDays, exerciseMissedDays],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: isActive 
              ? "Missed Days Over the Past Week"
              : "Total Missed Days Per Diet and Exercise"
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 7, // Setting max y to 7 days
      },
    },
  };

  return (
    <div className="flex w-full justify-center">
      <div className="w-[320px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MissedDaysChart;
