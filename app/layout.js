import { Open_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { WeightUnitProvider } from "@/contexts/WeightUnitContext";

const opensans = Open_Sans({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

export const metadata = {
  title: "Diet & Exercise Tracker",
  description: "Track your daily diet and exercise toward your goal!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* google analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-LXCC1J48MT"
        ></script>
        <script>
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LXCC1J48MT');`}
        </script>
      </head>
      <body
        className={`w-full max-w-[1000px] mx-auto text-sm sm:text-base min-h-screen flex flex-col ${opensans.className} bg-purple-50 dark:bg-sky-50 text-stone-700`}
      >
        <WeightUnitProvider>
          <ThemeProvider>
            <AuthProvider>
              <Navbar />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </WeightUnitProvider>
      </body>
    </html>
  );
}
