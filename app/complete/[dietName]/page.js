"use client";

import FinalResultForm from "./FinalResultForm";
import Main from "@/components/shared/Main";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompletePage() {
  const { user } = useAuth();
  const { dietName: encodedDietName } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const dietName = decodeURIComponent(encodedDietName); // converts the encoded URL string back to a regular string, changing %20 to a space, before passing it to <FinalResultForm>

  const onSubmissionSuccess = () => {
    setIsSaved(true);
    setTimeout(() => router.push("/history"), 2000);
  };

  if (!user) return null;

  return (
    <Main>
      <FinalResultForm
        userId={user.uid}
        dietName={dietName}
        onSubmissionSuccess={onSubmissionSuccess}
      />
      {isSaved ? (
        <p className="text-center text-emerald-500 mt-2 transition duration-200">
          Your final result has been saved successfully!{" "}
          <i className="fa-regular fa-square-check  fa-lg"></i>
        </p>
      ) : (
        ""
      )}
    </Main>
  );
}
