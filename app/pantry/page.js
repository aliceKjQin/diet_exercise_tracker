import MacroGoals from "@/components/MacroGoals";
import Main from "@/components/Main";
import Pantry from "@/components/MyPantry";
import NutritionResultsAnalysis from "@/components/NutritionAnalysis";
import React from "react";

export default function PantryPage() {
  return (
    <Main>
      <div className="flex flex-col gap-6 sm:gap-8">
        <Pantry />
        {/* Section to set macro goals */}
        <MacroGoals />

        {/* Section for ingredients analysis */}
        <NutritionResultsAnalysis />
      </div>
    </Main>
  );
}
