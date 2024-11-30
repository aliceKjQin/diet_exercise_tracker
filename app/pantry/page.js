import MacroGoals from "@/app/pantry/MacroGoals";
import Main from "@/components/shared/Main";
import Pantry from "@/app/pantry/MyPantry";
import NutritionResultsAnalysis from "@/app/pantry/NutritionAnalysis";
import React from "react";

export default function PantryPage() {
  return (
    <Main>
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Section to set macro goals */}
        <MacroGoals />

        <Pantry />

        {/* Section for ingredients analysis */}
        <NutritionResultsAnalysis />
      </div>
    </Main>
  );
}
