"use client";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import Button from "./Button";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "@/firebase";
import { useSubjects } from "@/hooks/useSubjects";
import { usePathname } from "next/navigation";

export default function SubjectDropdown() {
  const { currentUser } = useAuth();
  const [newSubject, setNewSubject] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname()
  const dropdownRef = useRef(null); // Create a ref for the dropdown
  // hide dropdown when click outside the dropdown div
  const { subjects, addSubject, deleteSubject, selectSubject } = useSubjects();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleShowDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleViewAll = () => {
    handleShowDropdown();
    router.push("/subjects");
  };

  const handleAddSubject = async () => {
    try {
      await addSubject(newSubject)
      setNewSubject("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const handleDeleteSubject = async (subject) => {
    try {
      await deleteSubject(subject);
    } catch (error) {
      console.error(`Failed to delete subject: ${error.message}`);
    }
  };

  const handleSelectSubject = (subject) => {
    selectSubject(subject)
  };

  if (!currentUser) {
    return;
  }

  if (pathname == '/dashboard') {
    return
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button text="Subjects" clickHandler={handleShowDropdown} />
      {showDropdown && (
        <div className="absolute bg-purple-50 border mt-2 rounded-2xl shadow-lg z-10">
          {subjects.map((subject, subjectIndex) => (
            <div
              key={subjectIndex}
              className="flex justify-between items-center px-2 py-1"
            >
              <span
                onClick={() => {
                  handleShowDropdown();
                  handleSelectSubject(subject);
                }}
                className="cursor-pointer text-black uppercase"
              >
                {subject}
              </span>
              <button
                onClick={() => handleDeleteSubject(subject)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          ))}
          {/* add subject */}
          <div className="flex items-center px-2 py-1">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value.trim().toLowerCase())}
              placeholder="New Subject"
              className="border rounded px-2 py-1 text-black"
            />
            <button
              onClick={handleAddSubject}
              className="ml-2 bg-purple-400 text-white px-2 py-1 rounded"
            >
              Add
            </button>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}

          {/* view all subjects button */}
          <div className="flex justify-center py-2">
            <Button text="View All" dark clickHandler={handleViewAll} />
          </div>
        </div>
      )}
    </div>
  );
}
