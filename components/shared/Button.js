import { Fugaz_One, Roboto } from "next/font/google";
import React from "react";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Button(props) {
  const { type = "button", text, dark, full, clickHandler } = props;
  return (
    <button
      type={type}
      onClick={clickHandler}
      className={`rounded-full duration-200 hover:opacity-80 border-2 border-solid border-indigo-500 ${
        dark ? "bg-indigo-400 text-white" : "text-indigo-400"
      }  ${full ? "grid place-items-center w-full" : ""} `}
    >
      <p className={`px-6 sm:px-10 whitespace-nowrap py-2 ${roboto.className}`}>
        {text}
      </p>
    </button>
  );
}
