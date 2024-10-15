
import { Open_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider} from "@/contexts/AuthContext";
import Head from "./head";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";

const opensans = Open_Sans({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export const metadata = {
  title: "Diet & Exercise Tracker",
  description: "Track your daily diet and exercise toward your goal!",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <Head />
      <ThemeProvider>
        <AuthProvider>
          <body
            className={`w-full max-w-[1000px] mx-auto text-sm sm:text-base min-h-screen flex flex-col  ${opensans.className} bg-white dark:bg-zinc-900 text-slate-800 dark:text-white`}
          >
            <Navbar />
            {children}
          </body>
        </AuthProvider>
      </ThemeProvider>
    </html>
  );
}
