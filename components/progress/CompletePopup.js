import Link from 'next/link'
import React from 'react'

export default function CompletePopup({dietName}) {
  return (
    <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          aria-describedby="popup-description"
        >
          <div className="bg-indigo-500 text-white p-6 rounded-lg shadow-lg w-96 text-center ring-2 ring-lime-300">
            <h2 id="popup-title" className="text-lg font-bold mb-4 capitalize">
              {`${dietName} Diet Complete!`}
            </h2>
            <p id="popup-description" className="gap-2">
              <Link
                href={`/complete/${dietName}`}
                className="text-lime-300 font-bold block mb-6"
              >
                Go enter your final result{" "}
                <i className="fa-regular fa-flag"></i>
              </Link>

              <Link href={'/'} className="p-2 text-stone-300 block">Extend the diet?</Link>
            </p>
          </div>
        </div>
  )
}
