"use client";

import { Roboto } from "next/font/google";
import React, { useState } from "react";
import Button from "@/components/shared/Button";
import { validateNoteInput } from "@/utils/validateNoteInput";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function NoteModal({ onSave, onClose, initialNote }) {
  const [noteInputValue, setNoteInputValue] = useState(initialNote);
  const [error, setError] = useState("");

  const handleNoteChange = (e) => {
    const input = e.target.value;
    setNoteInputValue(input);

    const { valid, message } = validateNoteInput(input);
    if (valid) {
      setError("");
    } else {
      setError(message);
    }
  };

  const handleSubmit = () => {
    // Check if any error before submission
    if (error) {
      setError(error);
      return; // Stop submission if error exists
    }
    onSave(noteInputValue); // Call onSave with the valid input
  };

  return (
    <div className="relative flex flex-col bg-purple-100 dark:bg-sky-100 text-purple-500 dark:text-blue-500  p-4 gap-4 rounded-lg">
      <h2 className={`${roboto.className}`}>
        ✏️ {initialNote ? "Update" : "Add"} Note{" "}
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      <textarea
        value={noteInputValue}
        onChange={handleNoteChange}
        aria-label="note-input"
        placeholder="Type any observation on your diet, exercise today ..."
        className="bg-purple-200 dark:bg-sky-200 text-stone-700 border-2 border-purple-300 dark:border-blue-300 p-2 rounded-md  focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-blue-500"
        rows={8}
        autoFocus
      />
      <div className="flex gap-4 mx-auto max-w-[400px]">
        <Button
          clickHandler={handleSubmit}
          text={initialNote ? "Update" : "Save"}
          full
          dark
        />
        <Button clickHandler={onClose} text="Cancel" full dark />
      </div>
    </div>
  );
}
