"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/LanguageToggle/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/store/theme/ThemeProvider";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, status, signOut } = useAuth();
  const { t } = useI18n();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide navbar on auth-related pages
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return null;
  }

  const navigation = [
    { name: t("nav.home"), href: ROUTES.home },
    { name: t("nav.about"), href: ROUTES.about },
    { name: t("nav.assessment"), href: ROUTES.assessment },
    { name: t("nav.resources"), href: ROUTES.resources },
  ];

  const authNavigation = [
    { name: t("nav.dashboard"), href: ROUTES.dashboard },
    { name: t("nav.assessmentResults"), href: ROUTES.assessmentResult },
    { name: t("nav.mentor"), href: ROUTES.mentor },
    { name: t("nav.careerReport"), href: ROUTES.careerReport },
  ];

  return (
    <nav className={cn(
      "sticky top-0 z-50 backdrop-blur-md transition-all duration-300 border-b relative",
      theme === "light"
        ? "bg-background/80 border-border/40 shadow-sm"
        : "bg-gradient-to-r from-primary-indigo/90 via-primary-navy/90 to-primary-indigo/90 border-white/10 shadow-2xl"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex-shrink-0 logo-glow">
              <Image
                src="/logo.png"
                alt="UdaanSetu.AI Logo"
                width={40}
                height={40}
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
              {/* Glow ring effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent via-teal to-purple opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold brand-name cursor-pointer">
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
                theme === "light"
                  ? "from-yellow-600 via-yellow-500 to-amber-500 group-hover:from-yellow-500 group-hover:to-amber-400"
                  : "from-yellow-400 via-yellow-300 to-amber-300 group-hover:from-yellow-300 group-hover:to-amber-200"
              )}>
                udaan
              </span>
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
                theme === "light"
                  ? "from-amber-500 via-orange-500 to-orange-600 group-hover:from-amber-400 group-hover:to-orange-500"
                  : "from-amber-300 via-orange-300 to-orange-400 group-hover:from-amber-200 group-hover:to-orange-300"
              )}>
                setu.ai
              </span>

            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Show appropriate links based on authentication status */}
            {status !== "authenticated" ? (
              // Unauthenticated users see: Home, About, Assessment, Resources
              navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-lg transition-all duration-200",
                    pathname === item.href
                      ? theme === "light"
                        ? "text-black bg-black/10 backdrop-blur-sm"
                        : "text-white bg-white/20 backdrop-blur-sm"
                      : theme === "light"
                        ? "text-black/90 hover:text-black hover:bg-black/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                >
                  {item.name}
                </Link>
              ))
            ) : (
              // Authenticated users see: Dashboard, Career Report, Mentor, Assessment (or Results)
              <>
                {/* 1. Dashboard */}
                <Link
                  href={ROUTES.dashboard}
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-lg transition-all duration-200",
                    pathname === ROUTES.dashboard
                      ? theme === "light"
                        ? "text-black bg-black/10 backdrop-blur-sm"
                        : "text-white bg-white/20 backdrop-blur-sm"
                      : theme === "light"
                        ? "text-black/90 hover:text-black hover:bg-black/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                >
                  {t("nav.dashboard")}
                </Link>

                {/* 2. Career Report */}
                <Link
                  href={ROUTES.careerReport}
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-lg transition-all duration-200",
                    pathname === ROUTES.careerReport
                      ? theme === "light"
                        ? "text-black bg-black/10 backdrop-blur-sm"
                        : "text-white bg-white/20 backdrop-blur-sm"
                      : theme === "light"
                        ? "text-black/90 hover:text-black hover:bg-black/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                >
                  {t("nav.careerReport")}
                </Link>

                {/* 3. Mentor */}
                <Link
                  href={ROUTES.mentor}
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-lg transition-all duration-200",
                    pathname === ROUTES.mentor
                      ? theme === "light"
                        ? "text-black bg-black/10 backdrop-blur-sm"
                        : "text-white bg-white/20 backdrop-blur-sm"
                      : theme === "light"
                        ? "text-black/90 hover:text-black hover:bg-black/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                >
                  {t("nav.mentor")}
                </Link>

                {/* 4. Assessment (Conditional) */}
                {/* Check if assessment result exists in localStorage */}
                {/* Using mounted check to prevent hydration mismatch */}
                {mounted && typeof window !== 'undefined' && localStorage.getItem('assessment_completed') ? (
                  <Link
                    href={ROUTES.assessmentResult}
                    className={cn(
                      "px-4 py-2 text-base font-medium rounded-lg transition-all duration-200",
                      pathname === ROUTES.assessmentResult
                        ? theme === "light"
                          ? "text-black bg-black/10 backdrop-blur-sm"
                          : "text-white bg-white/20 backdrop-blur-sm"
                        : theme === "light"
                          ? "text-black/90 hover:text-black hover:bg-black/5"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {t("nav.assessmentResults")}
                  </Link>
                ) : (
                  <Link
                    href={ROUTES.assessment}
                    className={cn(
                      "px-4 py-2 text-base font-medium rounded-lg transition-all duration-200",
                      pathname === ROUTES.assessment
                        ? theme === "light"
                          ? "text-black bg-black/10 backdrop-blur-sm"
                          : "text-white bg-white/20 backdrop-blur-sm"
                        : theme === "light"
                          ? "text-black/90 hover:text-black hover:bg-black/5"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {t("nav.assessment")}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <LanguageToggle />

            {status === "authenticated" && user ? (
              <div className="flex items-center space-x-4">
                <span className={cn(
                  "text-sm font-medium",
                  theme === "light" ? "text-black/90" : "text-white/90"
                )}>
                  <Link href="/dashboard/profile" className="hover:underline">
                    View Profile
                  </Link>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className={theme === "light"
                    ? "border-black/30 text-black hover:bg-black/10"
                    : "border-white/30 text-white hover:bg-white/10"
                  }
                >
                  {t("nav.signOut")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth?mode=sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={theme === "light"
                      ? "text-black hover:bg-black/10"
                      : "text-white hover:bg-white/10"
                    }
                  >
                    {t("nav.signIn")}
                  </Button>
                </Link>
                <Link href="/auth?mode=sign-up">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-white glow-orange">
                    {t("nav.getStarted")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-background/95 dark:bg-primary-navy/95 backdrop-blur-md",
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="py-4 space-y-2 border-t border-foreground/10 dark:border-white/10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-lg transition-colors font-medium",
                  theme === "light"
                    ? "text-black/90 hover:text-black hover:bg-black/10"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {status === "authenticated" && authNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-lg transition-colors font-medium",
                  theme === "light"
                    ? "text-black/90 hover:text-black hover:bg-black/10"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className={cn(
              "pt-4 border-t",
              theme === "light" ? "border-black/10" : "border-white/10"
            )}>
              {status === "authenticated" && user ? (
                <div className="space-y-2">
                  <div className={cn(
                    "px-3 py-2 text-sm",
                    theme === "light" ? "text-black/90" : "text-white/90"
                  )}>
                    <Link href="/dashboard/profile" className="block w-full hover:underline" onClick={() => setIsMenuOpen(false)}>
                      View Profile
                    </Link>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full",
                      theme === "light"
                        ? "border-black/30 text-black hover:bg-black/10"
                        : "border-white/30 text-white hover:bg-white/10"
                    )}
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    {t("nav.signOut")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth?mode=sign-in">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full",
                        theme === "light"
                          ? "text-black hover:bg-black/10"
                          : "text-white hover:bg-white/10"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("nav.signIn")}
                    </Button>
                  </Link>
                  <Link href="/auth?mode=sign-up">
                    <Button
                      size="sm"
                      className="w-full bg-accent hover:bg-accent/90 text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("nav.getStarted")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
