"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useInactiveDiet } from "@/hooks/useInactiveDiet";
import { useState } from "react";
import useProgressData from "@/hooks/useProgressData";
import Loading from "@/components/Loading";
import Main from "@/components/Main";
import ProgressBar from "@/components/ProgressBar";
import WeightProgressBar from "@/components/WeightProgressBar";
import Login from "@/components/Login";
import MissedReasonsChart from "@/components/MissedReasonsChart";
import MissedDaysChart from "@/components/MissedDaysChart";
import Button from "@/components/Button";

export default function HistoryPageForSpecifiedDiet() {
  const [showImages, setShowImages] = useState(false);
  const { user, loading: loadingUser } = useAuth();
  const { inactiveDiets, loading: loadingInactiveDiets } =
    useInactiveDiet(user);
  const { dietName: encodedDietName } = useParams();
  const dietName = decodeURIComponent(encodedDietName);
  const specifiedDiet = inactiveDiets.find((diet) => diet.name === dietName);
  const { data, loading: loadingProgressData } = useProgressData(specifiedDiet);

  console.log(inactiveDiets);
  console.log("Specified diet data: ", specifiedDiet);

  const dietData = specifiedDiet?.details.dietData;
  const targetDays = specifiedDiet?.details.targetDays;
  const initialBodyImageUrl = specifiedDiet?.details.initialBodyImage;
  const currentBodyImageUrl = specifiedDiet?.details.currentBodyImage;
  const rating = specifiedDiet?.details.rating;
  const summary = specifiedDiet?.details.summary;
  const prosNcons = specifiedDiet?.details.prosNcons;

  const handleToggle = () => {
    setShowImages(!showImages);
  };

  if (loadingInactiveDiets || loadingProgressData || loadingUser)
    return <Loading />;

  if (!user) return <Login />;

  return (
    <Main>
      <div className="flex flex-col gap-8 items-center">
        <h3 className="font-bold text-lg sm:text-xl">
          Review{" "}
          <span className="textGradient dark:text-blue-500 capitalize">
            {dietName}
          </span>{" "}
          Result
        </h3>

        {/* Section for summary, star rating and pros & cons */}
        <div className="flex flex-col gap-6 items-center">
          {/* star rating */}
          {rating && (
            <div className="flex sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-star fa-solid ${
                    rating >= star ? "text-yellow-400" : "text-stone-300"
                  }`}
                ></i>
              ))}
            </div>
          )}
          {/* Summary */}
          {summary && (
            <div className="flex flex-col items-center">
              <h3 className="textGradient dark:text-blue-500 font-bold">
                Reflection & Summary
              </h3>
              <p>{summary}</p>
            </div>
          )}

          {/* Pros & Cons */}
          {prosNcons && (
            <div className="flex gap-10">
              <div className="flex flex-col gap-2">
                <h3 className="textGradient dark:text-blue-500 font-bold">
                  Pros
                </h3>
                {prosNcons.pros.length > 0 ? (
                  prosNcons.pros.map((pro, index) => <p key={index}>{pro}</p>)
                ) : (
                  <p>No pro is selected</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="textGradient dark:text-blue-500 font-bold">
                  Cons
                </h3>
                {prosNcons.cons.length > 0 ? (
                  prosNcons.cons.map((con, index) => <p key={index}>{con}</p>)
                ) : (
                  <p>No con is selected</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Days ProgressBar */}
        <ProgressBar
          dietData={dietData}
          targetDays={targetDays}
          dietName={dietName}
          isActive={false}
        />

        {/* Weight Progress Bar */}
        <WeightProgressBar
          startingWeight={specifiedDiet.details.initialWeight}
          finalWeight={specifiedDiet.details.currentWeight}
          targetWeight={specifiedDiet.details.targetWeight}
          userId={user.uid}
          dietName={specifiedDiet.name}
          isActive={false}
        />

        {/* Top 3 Diet & Exercise Missed Reasons Pie Chart */}
        <MissedReasonsChart
          dietMissedData={data.topDietMissedPercentages}
          exerciseMissedData={data.topExerciseMissedPercentages}
          isActive={false}
        />

        {/* Total Missed Days Per Diet and Exercise Bar Chart */}
        <MissedDaysChart
          dietMissedDays={data.totalDietMissedDays}
          exerciseMissedDays={data.totalExerciseMissedDays}
          isActive={false}
        />

        {/* Button to toggle image display */}
        <Button
          text={showImages ? "Hide Before & After" : "Show Before & After"}
          clickHandler={handleToggle}
          full
        />

        {/* initial vs. current image display section */}
        {showImages && (
          <div className="sm:flex gap-8 text-center">
            <div>
              <h3 className="mb-4 textGradient dark:text-blue-500 font-bold uppercase">
                Before
              </h3>
              {initialBodyImageUrl ? (
                <img
                src={initialBodyImageUrl}
                alt="Before Image"
                className="w-[220px] h-[280px] sm:w-[300px] sm:h-[360px] mb-4  object-cover rounded-lg"
              />
              
              ) : (
                <p>No initial image uploaded.</p>
              )}
            </div>
            <div>
              <h3 className="mb-4 textGradient dark:text-blue-500 font-bold uppercase">
                After
              </h3>
              {currentBodyImageUrl ? (
                <img
                src={currentBodyImageUrl}
                alt="After Image"
                className="w-[220px] h-[280px] sm:w-[300px] sm:h-[360px] mb-4  object-cover rounded-lg"
              />
              
              ) : (
                <p>No current image uploaded.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Main>
  );
}
