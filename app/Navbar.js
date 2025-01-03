"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Roboto } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/app/ThemeToggle";
import { useRouter, usePathname } from "next/navigation";
import Loading from "../components/shared/Loading";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export default function Navbar() {
  const { user, logout, activeDiet, loading: loadingUser } = useAuth();
  const router = useRouter();
  const currentPath = usePathname(); // Get the current path

  if (loadingUser) return <Loading />;

  return (
    <nav className="bg-white shadow-sm textGradient dark:text-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex gap-4">
            <Link
              href="/"
              className={`flex-shrink-0 flex items-center font-bold ${roboto.className}`}
            >
              Home
            </Link>
            {user && (
              <Link
                href={"/history"}
                className={`flex-shrink-0 flex items-center font-bold ${roboto.className}`}
              >
                History
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <ThemeToggle />
                {activeDiet && (
                  <Link
                    href={`/dashboard/${activeDiet?.name}`}
                    className="font-bold mx-4"
                  >
                    Dashboard
                  </Link>
                )}
                {/* Hide Logout button on the homepage */}
                {currentPath !== "/" && (
                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="font-bold"
                  >
                    Logout
                  </button>
                )}
              </>
            ) : (
              <Link href="/login" className="font-bold">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
