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

const MissedDaysChart = ({ dietMissedDays, exerciseMissedDays }) => {
  const chartData = {
    labels: ["Diet", "Exercise"],
    datasets: [
      {
        label: "Missed Days",
        data: [dietMissedDays, exerciseMissedDays],
        borderWidth: 1,
        backgroundColor: "#FFAEBC", // Custom colors for bars
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Total Missed Days Per Diet and Exercise"
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
    <div className="flex mx-auto">
      <div className="w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MissedDaysChart;