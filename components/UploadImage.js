"use client";

import { useState } from "react";
import { storage, db } from "../firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "./Loading";

export default function UploadImage({ dietName, type = "current", existingImageUrl, onImageUpdate }) {
  const [image, setImage] = useState(null);
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

      // Update db and call the onImageUpdate prop
      await updateDoc(userRef, {
        [`diets.${dietName}.${imageType}`]: downloadUrl,
      });
      onImageUpdate(downloadUrl); // Pass the new URL to ProgressPage
      
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false)
    }
  };

  if (loading) return <Loading />

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
