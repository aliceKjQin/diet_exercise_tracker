"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePantry } from "@/hooks/usePantry";
import NutritionResultsAnalysis from "./NutritionAnalysis";
import Button from "./Button";
import Link from "next/link";

export default function MyPantry() {
  const { user, activeDiet } = useAuth();
  const [activeDietName, setActiveDietName] = useState(null);

  // Wait for activeDiet to initialize
  useEffect(() => {
    if (activeDiet?.name) {
      setActiveDietName(activeDiet.name);
    }
  }, [activeDiet]);

  const { pantry, loading, addPantryItem, removePantryItem } = usePantry(
    user?.uid,
    activeDietName
  );

  const [newItem, setNewItem] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const [commonPantryItems, setCommonPantryItems] = useState([
    "egg",
    "cheese",
    "milk",
    "chicken breast",
    "salmon",
    "broccoli",
    "spinach",
    "walnut",
    "almond",
    "rice",
    "chickpeas",
    "apple",
  ]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewItem(value);
  };

  const handleAddItem = async (itemsString) => {
    setErrMessage("")
    // Format itemsString
    const items = itemsString
      .split(",") // Split by comma
      .map((item) => item.trim()) // Remove extra spaces
      .filter((item) => item.length > 0); // Remove empty strings

    if (!items.length) {
      setErrMessage("Please enter at least one valid item.");
      return;
    }

    const alreadyInPantry = [];
    const failedItems = [];

    for (const item of items) {
      if (pantry.includes(item)) {
        alreadyInPantry.push(item);
      } else {
        const result = await addPantryItem(item);
        if (result.success && commonPantryItems.includes(item)) {
            setCommonPantryItems((prev) => prev.filter(commonItem => commonItem !== item))
        }
        if (!result.success) {
          failedItems.push(item);
        }
      }
    }

    if (alreadyInPantry.length) {
      setErrMessage(`Already in pantry: ${alreadyInPantry.join(", ")}`);
    }

    if (failedItems.length) {
        setErrMessage(`Failed to add: ${failedItems.join(", ")}. Please try again.`)
    }
    if (!alreadyInPantry.length && !failedItems.length) {
        setNewItem("")
    }
  };

  const renderPantryList = () => {
    if (loading) return <p>Loading your pantry ...</p>
    if(!pantry.length) return <p>Your pantry is empty.</p>

    return (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 items-center gap-2 capitalize bg-yellow-50 rounded-lg ring-2 ring-purple-200 dark:ring-blue-200">
            {pantry.map(item => (
                <div key={item} className="flex justify-between">
                    <p>{item}</p>
                    <button onClick={() => removePantryItem(item)}><i className="fa-solid fa-xmark text-stone-300 hover:text-red-400"></i></button>
                </div>
            ))}
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Go back button */}
      <div className=" textGradient dark:text-blue-500 font-bold mb-2">
        <Link href={`/dashboard/${activeDietName}`}>
          <i className="fa-solid fa-circle-arrow-left fa-lg"></i> Go back
        </Link>
      </div>
      <h3 className="text-xl font-bold mb-2">My Pantry <i className="fa-solid fa-basket-shopping textGradient dark:text-blue-500"></i></h3>
      {/* List of pantry items */}
      {renderPantryList()}
      
      
      {/* Section to display Common Pantry Items */}
      <h4 className="text-base font-semibold mt-2 text-center">
        Add Common Pantry Items
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {commonPantryItems.map((item) => (
          <p
            key={item}
            onClick={() => handleAddItem(item)}
            className="cursor-pointer bg-purple-100 hover:bg-purple-200 dark:bg-sky-100 dark:hover:bg-sky-200 p-2 rounded-md text-center capitalize"
          >
            {item}
          </p>
        ))}
      </div>

      {errMessage && (
          <div className="text-red-500 rounded-md">{errMessage}</div>
        )}

      {/* Section to add new item to the pantry */}
      <div className="flex flex-col gap-2">
        <textarea
          type="text"
          value={newItem}
          onChange={handleInputChange}
          placeholder='Add pantry items, separated by commas, like "egg, apple, milk"'
          className="border border-gray-300 rounded-md p-2 placeholder:whitespace-normal resize-none sm:h-10 h-15"
        />

        <Button text="Add" clickHandler={() => handleAddItem(newItem)} dark />
      </div>

    </div>
  );
}
