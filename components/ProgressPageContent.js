"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import UploadCurrentImage from "./UploadCurrentImage";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";

export default function ProgressPage({params}) {
  const [showImages, setShowImages] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const { user } = useAuth();
  const { dietName } = useParams(); // Extract dietName from the URL params

  const handleToggle = () => {
    setShowImages(!showImages);
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (!user || !dietName) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const dietData = userData.diets?.[dietName]; // Ensure dietName is defined
          if (dietData) {
            const dietData = userData.diets[dietName];
            setInitialImageUrl(dietData.initialImage);
            setCurrentImageUrl(dietData.currentImage);
          } else {
            console.log("No such document!");
          }
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
    fetchImages();
  }, [user, dietName]);

  return (
    <div className="progress-page">
      <h2>Diet Progress</h2>

      {/* Upload current body image */}
      <UploadCurrentImage dietName={dietName} />

      {/* Button to toggle image display */}
      <button onClick={handleToggle} className="toggle-button">
        {showImages ? "Hide Visual Progress" : "See Your Progress Visually"}
      </button>

      {/* Conditional rendering of images */}
      {showImages && (
        <div className="image-comparison">
          <div>
            <h3>Initial Image</h3>
            {initialImageUrl ? (
              <img src={initialImageUrl} alt="Initial Body Shape" />
            ) : (
              <p>No initial image uploaded.</p>
            )}
          </div>
          <div>
            <h3>Current Image</h3>
            {currentImageUrl ? (
              <img src={currentImageUrl} alt="Current Body Shape" />
            ) : (
              <p>No current image uploaded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
