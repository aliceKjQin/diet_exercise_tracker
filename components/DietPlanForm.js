"use client";

import { db, storage } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Loading from "./Loading";
import { useWeightUnit } from "@/contexts/WeightUnitContext";

export default function DietPlanForm() {
  const [dietPlan, setDietPlan] = useState({
    targetDays: "",
    targetWeight: "",
    initialWeight: "",
    dietName: "",
    initialBodyImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { weightUnit, setWeightUnit } = useWeightUnit();
  const { user, setActiveDiet } = useAuth();
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
        const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

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
      // check if it's valid whole number
      if (!/^\d*$/.test(value)) {
        setError("Please enter a valid whole number.");
        return;
      }

      setError("");
      setDietPlan((prev) => ({ ...prev, [name]: value ? Number(value) : "" }));
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
        // Check if diet with the same name exists
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const existingDiets = userSnap.data().diets || {};
          if (formattedDietName in existingDiets) {
            setError(
              `You already have a diet record named ${dietPlan.dietName}. Try a unique name, e.g., "${dietPlan.dietName} 2024 summer" or "${dietPlan.dietName} 2".`
            );
            setIsSubmitting(false);
            return;
          }
        }

        // If diet name is unique, proceed with saving diet data
        let downloadUrl = "";

        if (dietPlan.initialBodyImage) {
          const imageRef = ref(
            storage,
            `users/${user.uid}/diets/${formattedDietName}/initialBodyImage.jpg`
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
          doc(db, "users", user.uid),
          { diets: { [formattedDietName]: updatedDietPlan } },
          { merge: true }
        );

        // Set active diet in AuthContext after saving successfully, so homepage can render the newly added activeDiet
        setActiveDiet({
          name: formattedDietName,
          details: updatedDietPlan,
        });

        // Success: Clear the form and localStorage
        setDietPlan({
          targetDays: "",
          targetWeight: "",
          initialWeight: "",
          dietName: "",
          initialBodyImage: null,
        });
        localStorage.removeItem("dietPlan");
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

  return (
    <div className="max-w-lg mx-auto p-6 shadow-md rounded-lg">
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
            Duration (days)
          </label>
          <input
            type="text"
            id="targetDays"
            name="targetDays"
            value={dietPlan.targetDays}
            onChange={handleInputChange}
            placeholder="Enter a number"
            className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
            required
          />
        </div>

        {/* div for weightUnit and weight related fields */}
        <div className="py-4 flex flex-col gap-2 p-2 rounded-xl">
          {/* Weight Unit Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Choose your weight unit:
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value)}
                className="ml-2 p-1 rounded-md"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </label>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="initialWeight"
            >
              Starting Weight ({weightUnit})
            </label>
            <input
              type="text"
              id="initialWeight"
              name="initialWeight"
              value={dietPlan.initialWeight}
              onChange={handleInputChange}
              placeholder={`Starting weight in ${weightUnit}`}
              className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="targetWeight"
            >
              Target Weight ({weightUnit})
            </label>
            <input
              type="text"
              id="targetWeight"
              name="targetWeight"
              value={dietPlan.targetWeight}
              onChange={handleInputChange}
              placeholder={`Target weight in ${weightUnit}`}
              className="w-full border border-gray-300 p-2 rounded-md text-stone-800"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="initialBodyImage"
            className="block text-sm font-medium mb-1"
          >
            Upload Starting Body Image
          </label>
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
          className="w-full bg-indigo-400 text-white py-2 rounded-full hover:bg-indigo-500 transition-colors font-bold"
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
