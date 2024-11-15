"use client";

import { Roboto } from "next/font/google";
import React, { useState } from "react";
import Button from "@/components/shared/Button";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function NoteModal({ onSave, onClose, initialNote }) {
  const [noteInputValue, setNoteInputValue] = useState(initialNote);

  const handleSubmit = () => {
    onSave(noteInputValue); // Call onSave with the input note
  };

  return (
    <div className="relative flex flex-col bg-purple-100 dark:bg-sky-100 text-purple-500 dark:text-blue-500  p-4 gap-4 rounded-lg">
      <h2 className={`${roboto.className}`}>
        ✏️ {initialNote ? "Update" : "Add"} Note{" "}
      </h2>
      <textarea
        value={noteInputValue}
        onChange={(e) => setNoteInputValue(e.target.value)}
        placeholder="Type any notes on your diet, exercise, or feelings today"
        className="bg-purple-200 dark:bg-sky-200 text-stone-700 border-2 border-purple-300 dark:border-blue-300 p-2 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-blue-500"
        rows={2}
        autoFocus
      />
      <div className="flex gap-4 mt-auto max-w-[400px]">
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