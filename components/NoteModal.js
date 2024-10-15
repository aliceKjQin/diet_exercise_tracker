"use client";

import { Roboto } from "next/font/google";
import React, { useState } from "react";
import Button from "./Button";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function NoteModal({ onSave, onClose }) {
  const [noteInputValue, setNoteInputValue] = useState("");

  const handleSubmit = () => {
    onSave(noteInputValue); // Call onSave with the input note
  };

  return (
    <div className="relative flex flex-col bg-purple-50 text-purple-500 p-4 gap-4 rounded-lg">
      <h2 className={`${roboto.className}`}>✏️ Add an Optional Note </h2>
      <textarea
        value={noteInputValue}
        onChange={(e) => setNoteInputValue(e.target.value)}
        placeholder="Type your note here..."
        className="bg-purple-50"
      />
      <div className="flex gap-4 mt-auto max-w-[400px]">
        <Button clickHandler={handleSubmit} text="Save" full dark />
        <Button clickHandler={onClose} text="Cancel" full dark />
      </div>
    </div>
  );
}