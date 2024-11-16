"use client";

import { useState } from "react";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/shared/Loading";
import Button from "../shared/Button";

export default function UploadImage({ dietName, onNewImageUpload }) {
  const [image, setImage] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png"];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

    // Validate file type
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image (JPEG or PNG)");
      return;
    }

    // Validate file size
    if (file.size > maxSizeInBytes) {
      setError("File size must be less than 5 MB");
      return;
    }

    setImage(file);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !date) {
      setError("Please upload an image and select a date.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const storageRef = ref(
        storage,
        `users/${user.uid}/diets/${dietName}/images/${date}.jpg`
      );

      // Upload image to Firebase Storage
      await uploadBytes(storageRef, image);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update db and with image URL and date
      const newImage = {
        url: downloadUrl,
        date, // User-provided date
      };
      await updateDoc(userRef, {
        [`diets.${dietName}.images`]: arrayUnion(newImage),
      });

      onNewImageUpload(newImage); // Update parent component(ProgressPage) with the new image

      setDate("");
      setSuccess("Image saved!");
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <input
        type="file"
        onChange={handleImageUpload}
        className="block border border-stone-300 p-2 rounded-md text-stone-800 w-full"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="block border border-stone-300 p-2 rounded-md text-stone-800 w-full"
      />

      <button className="w-full p-2 ring-2 ring-pink-200 rounded-full font-bold">
        Upload Image
      </button>
      {error && <p className="p-2 text-red-200 text-center">{error}</p>}
      {success && <p className="p-2 text-emerald-200 text-center">{success}</p>}
    </form>
  );
}
