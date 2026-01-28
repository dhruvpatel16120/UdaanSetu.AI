import type { Metadata } from "next";
import { Poppins, Noto_Sans_Gujarati } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { LanguageFontWrapper } from "@/components/layout/LanguageFontWrapper";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const gujarati = Noto_Sans_Gujarati({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-gujarati",
  subsets: ["gujarati"],
});

export const metadata: Metadata = {
  title: "udaansetu.ai - Your AI Career Mentor for Rural Youth",
  description: "Bridging Rural Youth to Their Future. Discover your skills. Build your future with AI-powered career guidance.",
  keywords: ["career guidance", "AI mentor", "rural youth", "skills", "future careers"],
  authors: [{ name: "FutureMinds" }],
  openGraph: {
    title: "udaansetu.ai - Your AI Career Mentor for Rural Youth",
    description: "Bridging Rural Youth to Their Future. Discover your skills. Build your future.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getTheme() {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme) return storedTheme;
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                const theme = getTheme();
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} ${gujarati.variable} antialiased min-h-screen`}
      >
        <Providers>
          <LanguageFontWrapper>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </LanguageFontWrapper>
        </Providers>
      </body>
    </html>
  );
}
