"use client";

import { db, storage } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Loading from "./Loading";

export default function DietPlanForm() {
  const [dietPlan, setDietPlan] = useState({
    targetDays: "",
    targetWeight: "",
    initialWeight: "",
    dietName: "",
    initialBodyImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if there's stored data in localStorage and pre-fill the form
    const storedDietPlan = localStorage.getItem("dietPlan");
    if (storedDietPlan) {
      setDietPlan(JSON.parse(storedDietPlan));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "initialBodyImage") {
      // Handle file input
      // Check for valid file type
      if (files[0]) {
        const file = files[0];
        const validTypes = ["image/jpeg", "image/png"];
        const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

        // Validate file type
        if (!validTypes.includes(file.type)) {
          setError("Please upload a valid image (JPEG or PNG)");
          return; // Exit the function early
        }

        // Validate file size
        if (file.size > maxSizeInBytes) {
          setError("File size must be less than 2 MB");
          return; // Exit the function early
        }

        // If valid, update state
        setDietPlan((prev) => ({ ...prev, initialBodyImage: file }));
        setError("");
      }
    } else if (["targetDays", "targetWeight", "initialWeight"].includes(name)) {
      // Convert input value to number
      setDietPlan((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      // Handle other inputs as string
      setDietPlan((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Format the dietName before saving it
    const formattedDietName = dietPlan.dietName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " "); // Trims and replaces multiple spaces with a single space

    if (user) {
      try {
        // Save diet data
        const userRef = doc(db, "users", user.uid);
        let downloadUrl = "";

        if (dietPlan.initialBodyImage) {
          const imageRef = ref(
            storage,
            `users/${user.uid}/diets/${dietPlan.dietName}/initialBodyImage.jpg`
          );
          await uploadBytes(imageRef, dietPlan.initialBodyImage);
          downloadUrl = await getDownloadURL(imageRef);
        }

        const updatedDietPlan = {
          ...dietPlan,
          startDate: new Date().toLocaleDateString("en-CA"), // 'en-CA' gives the date format YYYY-MM-DD
          isActive: true,
          currentWeight: dietPlan.initialWeight,
          dietData: {},
          initialBodyImage: downloadUrl || null,
        };

        await setDoc(
          userRef,
          {
            diets: {
              [formattedDietName]: updatedDietPlan,
            },
          },
          { merge: true }
        );

        // Success: Clear the form and localStorage
        setDietPlan({
          targetDays: "",
          targetWeight: "",
          initialWeight: "",
          dietName: "",
          initialBodyImage: null,
        });
        localStorage.removeItem("dietPlan");

        // Show success message and direct to dashboard after two seconds
        setIsSaved(true);

        setTimeout(() => {
          router.push(`/dashboard/${dietPlan.dietName}`);
        }, 2000);
      } catch (error) {
        console.error("Error saving diet plan:", error);
        setError("Error saving diet plan. Please try again."); // indicate err to user
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Save form data to localStorage to preserve input if user needs to login first
      localStorage.setItem("dietPlan", JSON.stringify(dietPlan));
      // If user is not logged in, redirect to login and pass current path
      router.push(`/login?redirect=/dietPlan`);
    }
  };

  if (isSubmitting) {
    return <Loading />;
  }

  if (isSaved) {
    return (
      <div className="max-w-lg mx-auto mt-4 p-2 sm:text-xl bg-green-100 text-green-800 rounded-md">
        Your diet plan has been saved successfully! Redirecting to dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 shadow-md rounded-lg">
      <h1 className="text-xl font-bold mb-4 text-center">Create Diet Plan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dietName">
            Diet Name
          </label>
          <input
            type="text"
            id="dietName"
            name="dietName"
            value={dietPlan.dietName}
            onChange={handleInputChange}
            placeholder="Enter diet name (e.g., Vegan)"
            className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="targetDays"
          >
            Target Days
          </label>
          <input
            type="number"
            id="targetDays"
            name="targetDays"
            value={dietPlan.targetDays}
            onChange={handleInputChange}
            placeholder="Number of target days"
            className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="targetWeight"
          >
            Target Weight (kg)
          </label>
          <input
            type="number"
            id="targetWeight"
            name="targetWeight"
            value={dietPlan.targetWeight}
            onChange={handleInputChange}
            placeholder="Target weight in kg"
            className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="initialWeight"
          >
            Initial Weight (kg)
          </label>
          <input
            type="number"
            id="initialWeight"
            name="initialWeight"
            value={dietPlan.initialWeight}
            onChange={handleInputChange}
            placeholder="Initial weight in kg"
            className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
            required
          />
        </div>
        <div>
          <label htmlFor="initialBodyImage" className="block text-sm font-medium mb-1">Upload Initial Body Shape</label>
          <input
            type="file"
            name="initialBodyImage"
            className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
            onChange={handleInputChange}
            accept="image/*"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Submit Diet Plan
        </button>
      </form>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
