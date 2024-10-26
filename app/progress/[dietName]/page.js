"use client";

import { useState } from "react";
import UploadCurrentImage from "@/components/UploadImage";
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

export default function ProgressPage() {
  const [showImages, setShowImages] = useState(false);
  const { user } = useAuth();
  const { activeDiet, loading: loadingActiveDiet } = useActiveDiet(user);
  const { data, loading: loadingProgressData } = useProgressData(activeDiet);

  const dietName = activeDiet?.name;
  const dietData = activeDiet?.details.dietData;
  const targetDays = activeDiet?.details.targetDays;
  const initialImageUrl = activeDiet?.details?.initialBodyImage;
  const currentImageUrl = activeDiet?.details?.currentBodyImage;
  console.log("Data for chart in progress page: ", data);

  const handleToggle = () => {
    setShowImages(!showImages);
  };

  if (loadingActiveDiet || loadingProgressData) {
    return <Loading />;
  }

  return (
    <Main>
      <Link href={`/dashboard/${dietName}`}> <span className="text-lg sm:text-xl">⬅️</span> Go back</Link>
      <div className="flex flex-col gap-8 justify-center items-center">
        <h3 className="font-bold text-lg sm:text-xl">Progress Overview</h3>

        {/* Pass dietData and targetDays to ProgressBar */}
        <ProgressBar dietData={dietData} targetDays={targetDays} />

        {/* Missed reasons percentage pie chart */}
        <MissedReasonsChart
          dietMissedData={data.dietMissedPercentages}
          exerciseMissedData={data.exerciseMissedPercentages}
        />

        {/* Missed days bar chart */}
        <MissedDaysChart
          dietMissedDays={data.dietMissedDays}
          exerciseMissedDays={data.exerciseMissedDays}
        />

        {/* Button to toggle image display */}
        <Button text={showImages ? "Hide Visual Progress" : "See Progress Visually"} clickHandler={handleToggle} full />

        {/* initial vs. current image display section */}
        {showImages && (
          <div className="sm:flex gap-8 text-center uppercase">
            <div>
              <h3 className="mb-4 textGradient">Before</h3>
              {initialImageUrl ? (
                <>
                  <img
                    src={initialImageUrl}
                    alt="Initial Body Shape"
                    className="w-[220px] h-[280px] sm:w-[300px] sm:h-[360px] mb-4  object-cover rounded-lg"
                  />
                  <UploadImage
                    dietName={dietName}
                    type="initial"
                    existingImageUrl={initialImageUrl}
                  />
                </>
              ) : (
                <div className="flex flex-col gap-6">
                  <p>No initial image uploaded.</p>
                  {/* Upload initial body image */}
                  <UploadImage dietName={dietName} type="initial" />
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-4 textGradient">After</h3>
              {currentImageUrl ? (
                <>
                  <img
                    src={currentImageUrl}
                    alt="Current Body Shape"
                    className="w-[220px] h-[280px] sm:w-[300px] sm:h-[360px] mb-4 object-cover rounded-lg"
                  />
                  <UploadImage
                    dietName={dietName}
                    type="current"
                    existingImageUrl={currentImageUrl}
                  />
                </>
              ) : (
                <div className="flex flex-col gap-6">
                  <p>No current image uploaded.</p>
                  {/* Upload current body image */}
                  <UploadImage dietName={dietName} type="current" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Main>
  );
}
