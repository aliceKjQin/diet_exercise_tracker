"use client";

import { useState } from "react";
import { storage, db } from "../firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "./Loading";

export default function UploadImage({ dietName, type = "current", existingImageUrl }) {
  const [image, setImage] = useState(null);
  const [isSaved, setIsSaved] = useState(null);
  const [loading, setLoading] = useState(null)
  const { user } = useAuth(); 

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return;

    setLoading(true)
    try {
      const userRef = doc(db, "users", user.uid);
      const imageType = type === "initial" ? "initialBodyImage" : "currentBodyImage"
      const storageRef = ref(
        storage,
        `users/${user.uid}/diets/${dietName}/${imageType}.jpg`
      );

      // Upload image to Firebase Storage
      await uploadBytes(storageRef, image);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update the specific diet with the currentBodyImage URL
      await updateDoc(userRef, {
        [`diets.${dietName}.${imageType}`]: downloadUrl,
      });

      // Todo: use success message instead of alert, when page reload(), display a spinner
      setIsSaved(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false)
    }
  };

  if (loading) return <Loading />

  if (isSaved) {
    return (
      <div className="max-w-lg mx-auto mt-4 p-2 sm:text-xl bg-green-100 text-green-800 rounded-md">
        {type === "current" ? "Current" : "Initial"} body image {existingImageUrl ? "updated" : "uploaded" } successfully!
      </div>
    );
  }

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          onChange={handleImageUpload}
          className="w-[220px] sm:w-[300px] block border border-stone-300 p-2 rounded-md text-stone-800"
        />
        <button
          type="submit"
          className="w-[220px] sm:w-[300px] bg-purple-400 dark:bg-blue-400 hover:bg-purple-200 hover:text-stone-600 font-bold py-2 px-6 rounded-3xl text-white"
        >
          {existingImageUrl ? "Update Image" : "Upload Image"}
        </button>
      </form>
    </div>
  );
}
