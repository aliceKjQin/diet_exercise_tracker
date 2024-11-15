"use client";

import { Roboto } from "next/font/google";
import Button from "@/components/shared/Button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signup, login } = useAuth();

  const router = useRouter();

  async function handleSubmit() {
    if (!email || !password || password.length < 6) {
      setErrorMessage(
        "Please provide valid email and password (min 6 characters)."
      );
      return;
    }
    setAuthenticating(true);
    setErrorMessage(""); // Clear previous error message if any
    try {
      if (isRegister) {
        console.log("Signing up a new user");
        await signup(email, password);
        router.push("/");
      } else {
        console.log("Logging in existing user");
        await login(email, password);
        router.push("/");
      }
    } catch (err) {
      console.log("Error Message: " + err.message, "Error Code: " + err.code);
      switch (err.code) {
        case "auth/user-not-found":
          setErrorMessage("No user found with this email.");
          break;
        case "auth/wrong-password":
          setErrorMessage("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email format.");
          break;
        default:
          setErrorMessage(
            "Failed to authenticate. Please try again. OR, register first if you don't have an account yet."
          );
      }
    } finally {
      setAuthenticating(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 justify-center items-center gap-4">
      <h3 className={`text-4xl sm:text-5xl md:text-6xl ${roboto.className}`}>
        {isRegister ? "Register" : "Log In"}
      </h3>
      <p>You&#39;re one step away!</p>
      {/* Input fields */}
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-[400px] mx-auto px-3 duration-200 hover:border-purple-400 dark:hover:border-blue-400 focus:border-purple-400 dark:focus:border-blue-400 py-2 sm:py-3 border border-solid border-purple-300 dark:border-blue-300 rounded-full outline-none text-black"
        placeholder="Email"
      />
      {/* password input field */}
      <div className="relative w-full max-w-[400px] mx-auto">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 duration-200 hover:border-purple-400 dark:hover:border-blue-400 focus:border-purple-400 dark:focus:border-blue-400 py-2 sm:py-3 border border-solid border-purple-300 dark:border-blue-300 rounded-full outline-none text-black"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 dark:text-blue-400"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Show error message */}
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      {/* Submit button */}
      <div className="max-w-[400px] w-full mx-auto">
        <Button
          clickHandler={handleSubmit}
          text={authenticating ? "Submitting" : "Submit"}
          full
          dark
        />
      </div>
      {/* eslint-disable-next-line react/no-unescaped-entities */}
      <p className="text-center">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setErrorMessage(""); // Clear error message when switching mode
          }}
          className="text-purple-400 dark:text-blue-400"
        >
          {isRegister ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
