'use client'

import { useState } from "react";
import { storage, db } from "../firebase"; // Import your firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export default function UploadCurrentImage({ dietName }) {
  const [currentImage, setCurrentImage] = useState(null);
  const { user } = useAuth(); // Get the current logged-in user

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setCurrentImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentImage) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const storageRef = ref(storage, `users/${user.uid}/diets/${dietName}/currentBodyImage.jpg`);

      // Upload image to Firebase Storage
      await uploadBytes(storageRef, currentImage);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update the specific diet with the currentBodyImage URL
      await updateDoc(userRef, {
        [`diets.${dietName}.currentBodyImage`]: downloadUrl,
      });

      alert("Current body image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageUpload} />
        <button type="submit">Upload Current Body Image</button>
      </form>
    </div>
  );
}
