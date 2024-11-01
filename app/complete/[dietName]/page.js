"use client";

import FinalResultForm from "@/components/FinalResultForm";
import Main from "@/components/Main";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompletePage() {
  const { user } = useAuth();
  const { dietName: encodedDietName } = useParams()
  const [ isSaved, setIsSaved ] = useState(false)
  const router = useRouter()

  const dietName = decodeURIComponent(encodedDietName) // converts the encoded URL string back to a regular string, changing %20 to a space, before passing it to <FinalResultForm>

  const onSubmissionSuccess = () => {
    setIsSaved(true)
    setTimeout(() => router.push('/history'), 2000)
  }

  if (!user) return null;

  return (
    <Main>
      <FinalResultForm userId={user.uid} dietName={dietName} onSubmissionSuccess={onSubmissionSuccess} />
      { isSaved ? (<div className="max-w-lg mx-auto mt-4 p-2 sm:text-xl bg-green-100 text-green-800 rounded-md">
        Your final result has been saved successfully!
      </div>) : "" }
    </Main>
  );
}
