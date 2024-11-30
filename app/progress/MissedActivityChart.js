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

Chart.defaults.color = "#fff"; // reset default color to white instead of gray

export default function MissedActivityChart({ neutralFaceCount, sadFaceCount, targetDays }) {

  const missedActivityChartData = {
    labels: ["Missed Activity Days"], // Single label for the stacked bar
    datasets: [
      {
        label: "Completed One Activity",
        data: [neutralFaceCount],
        backgroundColor: "#FFED83", // Yellow for neutral face
      },
      {
        label: "Completed Neither Activity",
        data: [sadFaceCount],
        backgroundColor: "#FFAEBC", // Pink for sad face
  
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, index) => ({
              text: `${dataset.label}: ${dataset.data[0]}`, // Combine label with data value
              fillStyle: dataset.backgroundColor, // Use dataset color for the legend
              hidden: !chart.isDatasetVisible(index),
              fontColor: "#fff", // Explicitly set the text color for each legend label text
            }));
          },
        },
      },
    },
    
    scales: {
      x: {
        stacked: true, // Enable stacking for x-axis
      },
      y: {
        stacked: true, // Enable stacking for y-axis
        beginAtZero: true, // Start the y-axis at zero
        max: targetDays, // Set the maximum value for the y-axis
      },
    },
  };

  return (
    <div className="flex mx-auto">
      <div className="w-full">
        <Bar data={missedActivityChartData} options={options} />
      </div>
    </div>
  );
};
