"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useInactiveDiet } from "@/hooks/useInactiveDiet";
import { useState } from "react";
import useProgressData from "@/hooks/useProgressData";
import Loading from "@/components/shared/Loading";
import Main from "@/components/shared/Main";
import MainProgressCharts from "@/components/progress/MainProgressCharts";
import WeightProgressBar from "@/components/progress/WeightProgressBar";
import Login from "@/components/shared/Login";
import Button from "@/components/shared/Button";
import Image from "next/image";

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
                <Image
                  src={initialBodyImageUrl}
                  alt="Before Image"
                  width={300}
                  height={360}
                  className="mb-4 object-cover rounded-lg"
                  sizes="(max-width: 640px) 220px, 300px"
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
                <Image
                  src={currentBodyImageUrl}
                  alt="After Image"
                  width={300}
                  height={360}
                  className="mb-4 object-cover rounded-lg"
                  sizes="(max-width: 640px) 220px, 300px"
                />
              ) : (
                <p>No current image uploaded.</p>
              )}
            </div>
          </div>
        )}

        {/* Section for summary, heart rating and pros & cons */}
        <div className="flex flex-col gap-6 items-center">
          {/* heart rating */}
          {rating && (
            <div className="flex gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((heart) => (
                <i
                  key={heart}
                  className={`fa-heart fa-solid ${
                    rating >= heart ? "text-pink-400" : "text-stone-300"
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
        <MainProgressCharts
          diet={specifiedDiet}
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
      </div>
    </Main>
  );
}
