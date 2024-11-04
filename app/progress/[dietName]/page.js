"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveDiet } from "@/hooks/useActiveDiet";
import ProgressBar from "@/components/ProgressBar";
import Loading from "@/components/Loading";
import Main from "@/components/Main";
import useProgressData from "@/hooks/useProgressData";
import MissedReasonsChart from "@/components/MissedReasonsChart";
import UploadImage from "@/components/UploadImage";
import MissedDaysChart from "@/components/MissedDaysChart";
import Button from "@/components/Button";
import Link from "next/link";
import WeightProgressBar from "@/components/WeightProgressBar";
import Image from "next/image";

export default function ProgressPage() {
  const [showImages, setShowImages] = useState(false);
  const { user } = useAuth();
  const { activeDiet, loading: loadingActiveDiet } = useActiveDiet(user);
  const { data, loading: loadingProgressData } = useProgressData(activeDiet);

  const [initialImageUrl, setInitialImageUrl] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  // Update image URLs when activeDiet data loads or changes
  useEffect(() => {
    if (activeDiet) {
      setInitialImageUrl(activeDiet.details?.initialBodyImage || null);
      setCurrentImageUrl(activeDiet.details?.currentBodyImage || null);
    }
  }, [activeDiet]);

  const dietName = activeDiet?.name;
  const dietData = activeDiet?.details.dietData;
  const targetDays = activeDiet?.details.targetDays;

  const handleToggle = () => {
    setShowImages(!showImages);
  };

  // Callback functions to update images on client without reloading
  const updateInitialImageUrl = (url) => setInitialImageUrl(url);
  const updateCurrentImageUrl = (url) => setCurrentImageUrl(url);

  if (loadingActiveDiet || loadingProgressData) {
    return <Loading />;
  }

  if (!user) {
    return null; // Prevents further rendering of ProgressPage i.e. when user log out
  }

  return (
    <Main>
      {/* Go back button */}
      <div className=" textGradient dark:text-blue-500 font-bold mb-4">
        <Link href={`/dashboard/${dietName}`}>
          <i className="fa-solid fa-circle-arrow-left fa-lg"></i> Go back
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:gap-8 items-center">
        <h3 className="font-bold text-lg sm:text-xl">Progress Overview</h3>

        {/* Days Progress Bar */}
        <ProgressBar
          dietData={dietData}
          targetDays={targetDays}
          dietName={dietName}
          isActive
        />

        {/* Weight Progress Bar */}
        <WeightProgressBar
          startingWeight={activeDiet.details.initialWeight}
          targetWeight={activeDiet.details.targetWeight}
          userId={user.uid}
          dietName={activeDiet.name}
          isActive
        />

        {/* Missed reasons percentage pie chart */}
        <MissedReasonsChart
          dietMissedData={data.dietMissedPercentages}
          exerciseMissedData={data.exerciseMissedPercentages}
          isActive
        />

        {/* Missed days bar chart */}
        <MissedDaysChart
          dietMissedDays={data.dietMissedDays}
          exerciseMissedDays={data.exerciseMissedDays}
          isActive
        />

        {/* Button to toggle image display */}
        <Button
          text={showImages ? "Hide Visual Progress" : "Show Visual Progress"}
          clickHandler={handleToggle}
          full
        />

        {/* initial vs. current image display section */}
        {showImages && (
          <div className="sm:flex gap-8 text-center">
            <div className="flex flex-col items-center">
              <h3 className="mb-4 textGradient dark:text-blue-500 font-bold uppercase">
                Before
              </h3>
              {initialImageUrl ? (
                <>
                  <img
                    src={initialImageUrl}
                    alt="Before Image"
                    className="w-[220px] h-[280px] sm:w-[300px] sm:h-[360px] mb-4  object-cover rounded-lg"
                  />

                  <UploadImage
                    dietName={dietName}
                    type="initial"
                    existingImageUrl={initialImageUrl}
                    onImageUpdate={updateInitialImageUrl}
                  />
                </>
              ) : (
                <div className="flex flex-col gap-6">
                  <p>No initial image uploaded.</p>
                  {/* Upload initial body image */}
                  <UploadImage
                    dietName={dietName}
                    type="initial"
                    onImageUpdate={updateInitialImageUrl}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <h3 className="mb-4 textGradient dark:text-blue-500 font-bold uppercase">
                After
              </h3>
              {currentImageUrl ? (
                <>
                  <Image
                    src={currentImageUrl}
                    alt="After Image"
                    width={300}
                    height={360} 
                    className="mb-4 object-cover rounded-lg"
                    sizes="(max-width: 640px) 220px, 300px"
                  />

                  <UploadImage
                    dietName={dietName}
                    type="current"
                    existingImageUrl={currentImageUrl}
                    onImageUpdate={updateCurrentImageUrl}
                  />
                </>
              ) : (
                <div className="flex flex-col gap-6">
                  <p>No current image uploaded.</p>
                  {/* Upload current body image */}
                  <UploadImage
                    dietName={dietName}
                    type="current"
                    onImageUpdate={updateCurrentImageUrl}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Main>
  );
}
