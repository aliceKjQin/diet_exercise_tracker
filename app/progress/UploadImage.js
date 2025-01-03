"use client";

import { useState } from "react";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/shared/Loading";

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

      // Generate a unique identifier for the image
      const uid = Date.now().toString(); // Unique ID based on timestamp

      const storageRef = ref(
        storage,
        `users/${user.uid}/diets/${dietName}/images/${uid}.jpg`
      );

      // Upload image to Firebase Storage
      await uploadBytes(storageRef, image);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update db and with image URL and date
      const newImage = {
        uid, // Save the unique identifier
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
    <form onSubmit={handleSubmit} className="space-y-4 mr-4">
      {/*  file field */}
      <div>
        <label className="block font-semibold mb-1" htmlFor="file">
          Select an image
        </label>
        <input
          id="file"
          type="file"
          onChange={handleImageUpload}
          className="block p-2 rounded-md w-full border-outline-none ring-2 ring-lime-200"
        />
      </div>
      {/*  date field */}
      <div className="">
        <label className="block font-semibold mb-1" htmlFor="date">
          Select a date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="block p-2 rounded-md bg-indigo-400 w-full border-
        outline-none ring-2 ring-lime-200 mb-1"
        />
      </div>

      {error && (
        <p className="text-red-200 text-center text-wrap">
          {error} <i className="fa-regular fa-circle-xmark fa-lg"></i>
        </p>
      )}
      {success && (
        <p className="text-emerald-200 text-center transition duration-200">
          {success} <i className="fa-regular fa-square-check  fa-lg"></i>
        </p>
      )}

      <button
        type="submit"
        className="w-full p-2 bg-pink-400 hover:bg-pink-200 hover:text-stone-700 rounded-full font-bold"
      >
        Upload Image
      </button>
    </form>
  );
  t;
}
