"use client";

import { Roboto } from "next/font/google";
import Button from "@/components/shared/Button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword } from "@/app/login/validateEmailNpassword";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState("");

  const { signup, login, sendPasswordReset } = useAuth();

  const router = useRouter();

  async function handleSubmit() {
    // Validate email before submission
    const { valid: emailValid, message: emailMessage } = validateEmail(email);
    if (!emailValid) {
      setErrorMessage(emailMessage);
      return;
    }

    setAuthenticating(true);
    setErrorMessage(""); // Clear previous error message if any
    try {
      if (isRegister) {
        // Validate password in create account view
        const { valid: passwordValid, message: passwordMessage } =
          validatePassword(password);
        if (!passwordValid) {
          setErrorMessage(passwordMessage);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match.");
          return;
        }
        await signup(email, password);
        router.push("/");
      } else {
        // Basic validation for Sign In to ensure no empty password
        if (!password) {
          setErrorMessage("Please enter your password.");
          return;
        }
        await login(email, password);
        router.push("/");
      }
    } catch (err) {
      console.log("Error Message: " + err.message, "Error Code: " + err.code);
      switch (err.code) {
        case "auth/email-already-in-use":
          setErrorMessage(
            "This email is already registered. Please use another email or log in."
          );
          break;
        case "auth/invalid-credential":
          setErrorMessage("Incorrect email or password. Please try again.");
          break;
        default:
          setErrorMessage("Failed to authenticate. Please try again.");
      }
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setErrorMessage("Please provide your email to reset the password.");
      return;
    }
    setErrorMessage("");
    setSuccess("");
    try {
      await sendPasswordReset(email);
      setSuccess(
        "Password reset email sent. Please check your inbox (or spam folder)."
      );
    } catch (error) {
      console.log("Error resetting password: ", error.message);
      setErrorMessage(
        "Failed to send reset email. Ensure your email is correct and try again."
      );
    }
  }

  return (
    <div className="flex flex-col flex-1 justify-center items-center gap-4">
      <h2 className="mb-6 text-3xl sm:text-4xl p-2 bg-indigo-400 rounded-lg">
        <div className="flex gap-2">
          <i className="fa-solid fa-face-smile text-green-300">$</i>
          <i className="fa-solid fa-face-meh text-yellow-300">?</i>
          <i className="fa-solid fa-face-frown text-red-300">?!</i>
        </div>
      </h2>
      <h3
        className={`mb-6 text-2xl sm:text-3xl text-center ${roboto.className}`}
      >
        {isRegister ? "Create an account" : "Welcome back. Sign in to continue"}
      </h3>
      {/* Email Input fields */}
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-[400px] px-3 py-2 sm:py-3 border border-solid  focus:border-indigo-400 focus:outline focus:outline-indigo-200 rounded-full text-black"
        placeholder="Email"
      />
      {/* Password input field */}
      <div className="relative w-full max-w-[400px]">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 sm:py-3 border border-solid  focus:border-indigo-400 focus:outline focus:outline-indigo-200 rounded-full text-black"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 "
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Forgot Password */}
      {!isRegister && (
        <p>
          <button onClick={handleForgotPassword} className="text-indigo-400">
            Forgot Password?
          </button>
        </p>
      )}

      {/* Confirm Password input (visible only in register mode) */}
      {isRegister && (
        <div className="relative w-full max-w-[400px]">
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 sm:py-3 border border-solid  focus:border-indigo-400 focus:outline focus:outline-indigo-200 rounded-full text-black"
            placeholder="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 "
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      )}

      {/* Show error, success, authenticating message */}
      {errorMessage && (
        <p className="text-red-500 text-sm p-2">{errorMessage}</p>
      )}
      {success && <p className="text-emerald-500 text-sm p-2">{success}</p>}
      {authenticating && (
        <p className="text-pink-400 text-sm p-2">Processing request ...</p>
      )}

      {/* Submit button */}
      <div className="max-w-[400px] w-full">
        <Button
          clickHandler={handleSubmit}
          text={isRegister ? "Create account" : "Sign in"}
          full
          dark
        />
      </div>
      {/* Switch between Login/Register */}
      <p className="text-center">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setErrorMessage(""); // Clear error message when switching mode
          }}
          className="text-indigo-400 "
        >
          {isRegister ? "Log in" : "Create account"}
        </button>
      </p>
    </div>
  );
}
