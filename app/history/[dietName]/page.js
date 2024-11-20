"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useInactiveDiet } from "@/hooks/useInactiveDiet";
import useProgressData from "@/hooks/useProgressData";
import Loading from "@/components/shared/Loading";
import Main from "@/components/shared/Main";
import MainProgressCharts from "@/components/progress/MainProgressCharts";
import WeightProgressBar from "@/components/progress/WeightProgressBar";
import Login from "@/components/shared/Login";
import { useNote } from "@/hooks/useNote";

export default function HistoryPageForSpecifiedDiet() {
  const { user, loading: loadingUser } = useAuth();
  const { inactiveDiets, loading: loadingInactiveDiets } =
    useInactiveDiet(user);
  const { dietName: encodedDietName } = useParams();
  const dietName = decodeURIComponent(encodedDietName); // Decode back to original dietName that matched the db
  const specifiedDiet = inactiveDiets.find((diet) => diet.name === dietName);
  const { data, loading: loadingProgressData } = useProgressData(specifiedDiet);
  const { notes } = useNote(user?.uid, dietName);
  console.log("Notes: ", notes);

  console.log(inactiveDiets);
  console.log("Specified diet data: ", specifiedDiet);

  const dietData = specifiedDiet?.details.dietData;
  const targetDays = specifiedDiet?.details.targetDays;
  const rating = specifiedDiet?.details.rating;
  const summary = specifiedDiet?.details.summary;
  const prosNcons = specifiedDiet?.details.prosNcons;
  const images = specifiedDiet?.details.images || [];

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

        {/* Transformation gallery */}
        {images.length > 0 && (
          <div className="w-full overflow-x-auto p-4 whitespace-nowrap bg-indigo-400 rounded-lg shadow-md text-white">
            {/* Title */}
            <h2 className="font-bold">
              <i className="fa-solid fa-camera-retro mr-2"></i>
              Transformation Gallery
            </h2>

            {images.map((image, index) => (
              <div key={index} className="inline-block w-[270px] p-2 mr-4">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm mr-2">{image.date}</p>
                  <img
                    src={image.url}
                    alt={`Progress Image ${index}`}
                    className="w-full h-[320px] object-cover rounded-lg ring ring-lime-300 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Weight Progress Bar */}
        <WeightProgressBar
          startingWeight={specifiedDiet.details.initialWeight}
          finalWeight={specifiedDiet.details.currentWeight}
          targetWeight={specifiedDiet.details.targetWeight}
          userId={user.uid}
          inactiveDiet ={specifiedDiet}
          isActive={false}
        />

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

        {/* Review Note Section */}
        {notes.length > 0 && (
          <div className="w-full p-4 bg-indigo-400 text-stone-700">
            <h2 className="font-bold text-lg text-white">
              <i className="fa-regular fa-note-sticky mr-2"></i>Review Notes
            </h2>
            <div className="flex flex-col gap-4 mt-4">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className="p-3 bg-yellow-200 shadow-sm rounded-lg flex flex-col"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">{note.date}</p>
                  </div>
                  <p className="mt-1">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Main>
  );
}
