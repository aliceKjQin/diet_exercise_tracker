"use client";

import { db, storage } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Loading from "../shared/Loading";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import Button from "../shared/Button";

export default function DietPlanForm() {
  const [dietPlan, setDietPlan] = useState({
    targetDays: "",
    targetWeight: "",
    initialWeight: "",
    dietName: "",
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
    const { name, value } = e.target;
    if (["targetDays", "targetWeight", "initialWeight"].includes(name)) {
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

        const updatedDietPlan = {
          ...dietPlan,
          startDate: new Date().toLocaleDateString("en-CA"), // 'en-CA' gives the date format YYYY-MM-DD
          isActive: true,
          currentWeight: dietPlan.initialWeight,
          dietData: {},
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
    <div className="w-[300px] mx-auto p-6 shadow-xl rounded-3xl ring-2 ring-lime-300">
      <h1 className="text-xl font-bold mb-6 text-center">Create Diet Plan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section for dietName and targetDays (duration) */}
        <section className="relative">
          <div className="mb-2">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="dietName"
            >
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
        </section>

        {/* Section for weightUnit and weight related fields */}
        <section className="relative border-t-2 border-gray-300 pt-8 mt-8">
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
          <div className="mb-2">
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
        </section>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
        <Button text="Submit" dark full/>
      </form>
    </div>
  );
}
