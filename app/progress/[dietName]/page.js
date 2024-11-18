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
      setImages(
        (activeDiet.details?.images || []).map((img) => ({
          ...img,
          deleting: false,
          deleteError: "",
        }))
      );
    }
  }, [activeDiet]);

  const addNewImage = (newImage) => {
    setImages((prev) => [
      ...prev,
      { ...newImage, deleting: false, deleteError: "" },
    ]); // Update state with the new image
  };

  const deleteImage = async (image) => {
    if (!user || !dietName) return;

    // Update local state to mark the image as being deleted
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.uid === image.uid
          ? { ...img, deleting: true, deleteError: "" }
          : img
      )
    );

    try {
      const userRef = doc(db, "users", user.uid);
      const storageRef = ref(
        storage,
        `users/${user.uid}/diets/${dietName}/images/${image.uid}.jpg`
      );
      // Prepare the original object by omitting the transient UI state properties before calling arrayRemove
      const originalImage = {
        uid: image.uid, // Use uid as the unique identifier
        url: image.url,
        date: image.date,
      };

      // Delete image from Firebase Storage
      await deleteObject(storageRef);

      // Remove image data from Firestore
      await updateDoc(userRef, {
        [`diets.${dietName}.images`]: arrayRemove(originalImage),
      });

      // Update local state to remove the deleted image on success
      setImages((prevImages) =>
        prevImages.filter((img) => img.uid !== image.uid)
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      // Update local state to show error for the specific image
      setImages(
        (prevImages) =>
          prevImages.map((img) =>
            img.uid === image.uid
              ? {
                  ...img,
                  deleting: false,
                  deleteError: "Failed to delete. Please try again.",
                }
              : img
          ) // deleting used to check for loading state & disable the delete button
      ); // if failed, add an failed state to that image and no need to reset the images local state with filter()
    }
  };

  if (loadingUser) return <Loading />;

  if (!user) {
    return <Login />; // Prevents further rendering of ProgressPage i.e. when user log out
  }

  return (
    <Main>
      {/* Go back button */}
      <Link
        href={`/dashboard/${activeDiet?.name}`}
        className="textGradient dark:text-blue-500 font-bold mb-2"
      >
        <i className="fa-solid fa-circle-arrow-left fa-lg mr-1"></i> Go back
      </Link>

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
            <h2 className="font-bold">
              <i className="fa-solid fa-camera-retro mr-2"></i>Document Your
              Transformation
            </h2>

            {/* Images and Upload Button */}
            <div className="inline-flex gap-1">
              {images.map((image, index) => (
                <div key={index} className="inline-block w-[270px] p-2 mr-4">
                  <div className="flex flex-col items-center gap-2">
                    {/* div for image date and delete button */}
                    <div className="flex items-center p-1 gap-2">
                      <p className="text-sm mr-2">{image.date}</p>
                      <button
                        onClick={() => deleteImage(image)}
                        disabled={image.deleting}
                      >
                        <i className="fa-solid fa-trash-can text-indigo-300 hover:text-red-400"></i>
                      </button>
                    </div>
                    {/* display loading or error on deleting  */}
                    {image.deleting && <Loading />}
                    {image.deleteError && (
                      <p className="text-center text-red-200"> <i class="fa-regular fa-circle-xmark fa-xl"></i>
                        {image.deleteError} 
                      </p>
                    )}

                    <img
                      src={image.url}
                      alt={`Progress Image ${index}`}
                      className="w-full h-[320px] object-cover rounded-lg ring ring-lime-300 bg-white"
                    />
                  </div>
                </div>
              ))}
              {/* Positioned Upload Image Button */}
              <div className="inline-block w-[270px] h-[300px] p-2 mt-8">
                <UploadImage
                  dietName={dietName}
                  onNewImageUpload={addNewImage}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-indigo-400 w-full rounded-lg text-white ring-2 ring-lime-300">
            {/* Title */}
            <h2 className="font-bold">
              <i className="fa-solid fa-camera-retro mr-2"></i>Document Your
              Transformation
            </h2>
            <div className=" w-[270px] p-1 mx-auto mt-2">
              <UploadImage dietName={dietName} onNewImageUpload={addNewImage} />
            </div>
          </div>
        )}
      </div>
    </Main>
  );
}
