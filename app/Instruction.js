import React from "react";

export default function Instruction() {
  return (
    <div className="flex flex-col gap-2 p-2 bg-indigo-50 ring-2 ring-indigo-300 rounded-md">
      <h3 className="font-bold text-center">Quick Start Guide</h3>

      <p>
        <strong>Dashboard:</strong> Log exercise and diet, and add optional
        notes to record any observations, go to recipes or a work out plan you want to try ...
      </p>
      <p>
        <strong>Pantry:</strong> Analyze nutrition of items in your pantry or a
        recipe. Access this feature in the Dashboard by clicking{" "}
        <em>&quot;View Pantry&quot;</em>.
      </p>
      <p>
        <strong>Progress:</strong> Track your progress with data visualizations,
        and upload body images to document your transformation. Access this
        feature in the Dashboard by clicking <em>&quot;View Progress&quot;</em>.
      </p>
      <p>
        <strong>History:</strong> Review past diet plans and their details.
      </p>
    </div>
  );
}
