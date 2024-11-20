import React from "react";

export default function ReviewNotes({ notes, loadingNotes }) {
  return (
    <div className="w-full p-4 bg-indigo-400 text-stone-800">
      <h2 className="font-bold text-lg text-white">
        <i className="fa-regular fa-note-sticky mr-2"></i>Review Notes
      </h2>
      {loadingNotes ? (
        <p className="text-white">Loading your notes ...</p>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <div
                key={index}
                className="p-3 bg-yellow-200 shadow-sm rounded-lg flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{note.date}</p>
                  <button onClick={() => deleteNote(note.date)}>
                    <i className="fa-solid fa-trash-can text-stone-400 hover:text-red-300"></i>
                  </button>
                </div>
                <p className="mt-1">{note.note}</p>
              </div>
            ))
          ) : (
            <p className="text-white">No notes available to review.</p>
          )}
        </div>
      )}
    </div>
  );
}
