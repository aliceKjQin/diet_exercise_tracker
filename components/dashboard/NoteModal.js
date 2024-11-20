"use client";

import { Roboto } from "next/font/google";
import React, { useState } from "react";
import Button from "@/components/sharedUI/Button";

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
        placeholder="Type any observation on your diet, exercise today ..."
        className="bg-purple-200 dark:bg-sky-200 text-stone-700 border-2 border-purple-300 dark:border-blue-300 p-2 rounded-md  focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-blue-500"
        rows={15}
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
