import { Open_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { WeightUnitProvider } from "@/contexts/WeightUnitContext";
import Script from "next/script";

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
        {/* <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X5WSV2ZG95"
          strategy="afterInteractive"
        ></Script>
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X5WSV2ZG95');
          `}
        </Script> */}

        {/* Microsoft Clarity */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "otozvyq0wi");
      `,
          }}
        /> */}

        <script src="https://developer.edamam.com/attribution/badge.js"></script>
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
