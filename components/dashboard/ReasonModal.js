"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";

const reasons = [
  "Feeling hungry",
  "Family/friends in town",
  "Traveling",
  "Busy schedule",
  "Not feeling well",
  "Other",
];

export default function ReasonModal({ type, onSave, onClose }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [wordLimitReached, setWordLimitReached] = useState(false);

  const handleSave = () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    onSave(reason); // Pass the selected or custom reason back to parent, which is the handleReasonSave function
  };

  const handleCustomReasonChange = (e) => {
    const input = e.target.value;
    const wordCount = input.trim().split(/\s+/).length;

    // Check if word count exceeds the limit
    if (wordCount <= 3) {
      setCustomReason(input);
      setWordLimitReached(false);
    } else {
      setWordLimitReached(true);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 text-black">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h3 className="text-xl font-bold">Why did you miss {type}?</h3>
        <div className="space-y-2">
          {reasons.map((reason) => (
            <label key={reason} className="block">
              <input
                type="radio"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
              />
              <span className="ml-2">{reason}</span>
            </label>
          ))}
          {selectedReason === "Other" && (
            <>
              <input
                type="text"
                value={customReason}
                onChange={handleCustomReasonChange}
                placeholder="Enter custom reason"
                className="w-full border p-2 rounded-lg"
              />
              {wordLimitReached && (
                <p className="text-red-500 text-sm">Limit: 3 words</p>
              )}
            </>
          )}
        </div>
        {/* div for cancel and save buttons */}
        <div className="flex justify-end space-x-2">
          <Button text="Cancel" clickHandler={onClose} />
          <Button text="Save" clickHandler={handleSave} />
        </div>
      </div>
    </div>
  );
}
