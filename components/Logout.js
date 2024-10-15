"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import Button from "./Button";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Logout() {
  const { logout, currentUser } = useAuth();
  const pathname = usePathname()

  if (!currentUser) {
    return null;
  }

  if (pathname === '/' || pathname === '/dashboard') {
    return (
        <Link href={'/subjects'}>
            <Button text='View All Subjects' />
        </Link>
    )
  }

  return <Button text="Logout" clickHandler={logout} dark />;
}
