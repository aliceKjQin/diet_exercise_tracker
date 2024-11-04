import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, Colors, Title } from "chart.js";

// Register necessary components
Chart.register(ArcElement, Tooltip, Legend, Colors, Title);

// Register custom plugin for displaying "No data available" message
Chart.register({
    id: 'noDataMessage',
    afterDraw: (chart) => {
      const { datasets } = chart.data;
      const hasData = datasets.some((dataset) => dataset.data.length > 0);
      const { ctx, width, height } = chart;
  
      // Draw gray outline when there's no data
      if (!hasData) {
        ctx.save();
        const radius = Math.min(width, height) / 2 - 30; // Adjusting the radius
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.lineWidth = 2; // Thinner line for outline
        ctx.strokeStyle = 'lightgray'; // Outline color
        ctx.stroke();
        ctx.restore();
  
        // Display "No data available" message
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'gray';
        ctx.fillText('Pie Chart: No Missed Records', width / 2, height / 2);
        ctx.restore();
      }
    },
  });

export default function MissedReasonsChart({
  dietMissedData = {}, // Default to an empty object if undefined
  exerciseMissedData = {},
  isActive
}) {
  const dietLabels = Object.keys(dietMissedData);
  const dietPercentages = Object.values(dietMissedData);

  const exerciseLabels = Object.keys(exerciseMissedData);
  const exercisePercentages = Object.values(exerciseMissedData);

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
        text: isActive
          ? "Diet Missed Reasons Past Week"
          : "Top 3 Diet Missed Reasons",
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
        text: isActive
        ? "Exercise Missed Reasons Past Week" 
        : "Top 3 Exercise Missed Reasons ",
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
