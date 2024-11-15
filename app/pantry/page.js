import MacroGoals from "@/components/pantry/MacroGoals";
import Main from "@/components/shared/Main";
import Pantry from "@/components/pantry/MyPantry";
import NutritionResultsAnalysis from "@/components/pantry/NutritionAnalysis";
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
