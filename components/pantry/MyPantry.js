"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePantry } from "@/hooks/usePantry";
import Button from "@/components/sharedUI/Button";
import { validateAddItemInput } from "@/utils";

export default function MyPantry() {
  const { user, activeDiet } = useAuth();
  const [activeDietName, setActiveDietName] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [addingItems, setAddingItems] = useState(false);

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

  const handleInputChange = (e) => {
    setNewItem(e.target.value); // Update the input value as user's typing
  };

  const handleAddItem = async (input) => {
    setErrMessage(""); // Clear previous error messages

    // Validate the input
    const { valid, message } = validateAddItemInput(input);
    if (!valid) {
      setErrMessage(message);
      return;
    }

    setAddingItems(true);

    try {
      // Format input
      const items = input
        .toLowerCase()
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
            setCommonPantryItems((prev) =>
              prev.filter((commonItem) => commonItem !== item)
            );
          }
          if (!result.success) {
            failedItems.push(item);
          }
        }
      }

      if (alreadyInPantry.length) {
        setErrMessage(`Already in pantry: ${alreadyInPantry.join(", ")}`);
        setTimeout(() => setErrMessage(""), 2000);
      }

      if (failedItems.length) {
        setErrMessage(
          `Failed to add: ${failedItems.join(", ")}. Please try again.`
        );
      }

      setNewItem(""); // clear input
    } catch (error) {
      console.error("Failed adding items: ", error);
    } finally {
      setAddingItems(false);
    }
  };

  const renderPantryList = () => {
    if (loading) return <p>Loading your pantry ...</p>;
    if (!pantry.length)
      return (
        <p className="p-4 bg-yellow-200 rounded-lg ring-2 ring-purple-200 dark:ring-blue-200">
          Your pantry is empty.
        </p>
      );

    return (
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 items-center gap-2 capitalize bg-yellow-200 rounded-lg ring-2 ring-purple-200 dark:ring-blue-200">
        {pantry.map((item) => (
          <div key={item} className="flex justify-between">
            <p>{item}</p>
            <button onClick={() => removePantryItem(item)}>
              <i className="fa-solid fa-xmark fa-lg text-stone-300 hover:text-red-400"></i>
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <h3 className="text-xl font-bold mb-2">
        <i className="fa-solid fa-basket-shopping textGradient dark:text-blue-500 mr-2"></i>
        My Pantry
      </h3>
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
            className="cursor-pointer bg-purple-100 hover:bg-purple-200 dark:bg-sky-100 dark:hover:bg-sky-200 shadow-md p-2 rounded-2xl text-center capitalize"
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
          className="border border-gray-300 rounded-md p-2 placeholder:whitespace-normal resize-none sm:h-10 h-15 mb-4"
        />

        {addingItems && <p className="text-pink-400 text-sm text-center">Adding items ...</p>}

        <Button text="Add" clickHandler={() => handleAddItem(newItem)} dark />
      </div>
    </div>
  );
}
