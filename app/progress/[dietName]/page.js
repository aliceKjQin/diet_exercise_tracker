"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainProgressCharts from "@/components/progress/MainProgressCharts";
import Loading from "@/components/shared/Loading";
import Main from "@/components/shared/Main";
import UploadImage from "@/components/progress/UploadImage";
import Link from "next/link";
import WeightProgressBar from "@/components/progress/WeightProgressBar";
import Login from "@/components/shared/Login";
import { db, storage } from "@/firebase";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export default function ProgressPage() {
  const { user, activeDiet, loading: loadingUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [targetDays, setTargetDays] = useState(null);
  const [dietData, setDietData] = useState({});
  const [dietName, setDietName] = useState("");

  // Update image URLs when activeDiet data loads or changes
  useEffect(() => {
    if (activeDiet) {
      setTargetDays(activeDiet.details?.targetDays || "");
      setDietData(activeDiet.details?.dietData || {});
      setDietName(activeDiet.name || "");
      setImages(activeDiet.details?.images || []);
    }
  }, [activeDiet]);

  const addNewImage = (newImage) => {
    setImages((prev) => [...prev, newImage]); // Update state with the new image
  };

  const deleteImage = async (image) => {
    if (!user || !dietName) return;

    setError("");
    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      const storageRef = ref(
        storage,
        `users/${user.uid}/diets/${dietName}/images/${image.date}.jpg`
      );

      // Delete image from Firebase Storage
      await deleteObject(storageRef);

      // Remove image data from Firestore
      await updateDoc(userRef, {
        [`diets.${dietName}.images`]: arrayRemove(image),
      });

      // Update local state
      setImages((prevImages) =>
        prevImages.filter((img) => img.url !== image.url)
      );
      setSuccess("Removed image.");
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to save the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) return <Loading />;

  if (!user) {
    return <Login />; // Prevents further rendering of ProgressPage i.e. when user log out
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

        {/* Days Progress Bar with other charts */}
        <MainProgressCharts
          diet={activeDiet}
          dietData={dietData}
          targetDays={targetDays}
          dietName={dietName}
          isActive
        />

        {/* Weight Progress Bar */}
        <WeightProgressBar
          startingWeight={activeDiet?.details?.initialWeight}
          targetWeight={activeDiet?.details?.targetWeight}
          userId={user.uid}
          dietName={dietName}
          isActive
        />

        {/* Horizontally Scrollable Image Gallery */}
        {images.length > 0 ? (
          <div className="w-full overflow-x-auto p-4 whitespace-nowrap bg-indigo-400 rounded-lg shadow-md text-white">
            {/* Title */}
            <h2 className="font-bold p-4 text-base sm:text-lg">
            <i className="fa-solid fa-camera-retro"></i> Document Your Transformation
            </h2>

            {/* Images and Upload Button */}
            <div className="inline-flex gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="inline-block w-[220px] sm:w-[250px] p-2 mr-4"
                >
                  {loading && <Loading />}
                  {success && (
                    <p className="text-center text-emerald-200">{success}</p>
                  )}
                  {error && <p className="text-center text-red-200">{error}</p>}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center p-1 gap-2">
                      <p className="text-sm mr-2">{image.date}</p>
                      <button onClick={() => deleteImage(image)}>
                        <i className="fa-solid fa-trash-can text-indigo-300 hover:text-red-400"></i>
                      </button>
                    </div>
                    <img
                      src={image.url}
                      alt={`Progress Image ${index}`}
                      className="w-full h-[300px] object-cover rounded-lg ring ring-lime-300 bg-white"
                    />
                  </div>
                </div>
              ))}
              {/* Positioned Upload Image Button */}
              <div className="inline-block w-[220px] sm:w-[250px] p-2 mr-4">
                <UploadImage
                  dietName={dietName}
                  onNewImageUpload={addNewImage}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-indigo-400 w-full h-[300px] rounded-lg text-center text-white text-lg sm:text-lg ring-2 ring-lime-300">
            <p className="mt-12">No images uploaded.</p>
          </div>
        )}
      </div>
    </Main>
  );
}
