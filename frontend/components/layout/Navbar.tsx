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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Defer mounting to avoid synchronous setState warning
    setTimeout(() => setMounted(true), 0);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
    <nav className={cn(
      "sticky top-0 left-0 right-0 z-50 transition-all duration-500 w-full border-b backdrop-blur-2xl backdrop-saturate-150",
      scrolled
        ? theme === "light"
          ? "bg-white/90 border-black/10 shadow-lg shadow-black/5"
          : "bg-slate-950/90 border-white/10 shadow-2xl shadow-black/40"
        : theme === "light"
          ? "bg-white/40 border-black/5 shadow-sm"
          : "bg-slate-950/20 border-white/5 shadow-sm"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative no-print">
        {/* Animated Background Highlight for Links */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex-shrink-0 logo-glow">
              <Image
                src="/logo.png"
                alt="UdaanSetu.AI Logo"
                width={40}
                height={40}
                className="object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                priority
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent via-teal to-purple opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>
            </div>
            <span className="text-xl md:text-2xl font-bold brand-name hidden sm:block">
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
                theme === "light"
                  ? "from-yellow-600 via-yellow-500 to-amber-500"
                  : "from-yellow-400 via-yellow-300 to-amber-300"
              )}>
                udaan
              </span>
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
                theme === "light"
                  ? "from-amber-500 via-orange-500 to-orange-600"
                  : "from-amber-300 via-orange-300 to-orange-400"
              )}>
                setu.ai
              </span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {status !== "authenticated" ? (
            navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full overflow-hidden group/link",
                  pathname === item.href
                    ? theme === "light" ? "text-primary-indigo" : "text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">{item.name}</span>
                {/* Hover Pill Effect */}
                <span className={cn(
                  "absolute inset-0 transition-transform duration-300 scale-0 group-hover/link:scale-100 rounded-full z-0",
                  theme === "light" ? "bg-black/5" : "bg-white/10"
                )} />
                {/* Active Indicator */}
                {pathname === item.href && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                )}
              </Link>
            ))
          ) : (
            <>
              {[
                mounted && typeof window !== 'undefined' && localStorage.getItem('assessment_completed')
                  ? { name: t("nav.assessmentResults"), href: ROUTES.assessmentResult }
                  : { name: t("nav.assessment"), href: ROUTES.assessment },
                { name: t("nav.mentor"), href: ROUTES.mentor },
                { name: t("nav.careerReport"), href: ROUTES.careerReport },
                { name: t("nav.dashboard"), href: ROUTES.dashboard },
              ].map((item: { name: string; href: string }) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full overflow-hidden group/link",
                    pathname === item.href
                      ? theme === "light" ? "text-primary-indigo" : "text-white"
                      : theme === "light" ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white"
                  )}
                >
                  <span className="relative z-10">{item.name}</span>
                  <span className={cn(
                    "absolute inset-0 transition-transform duration-300 scale-0 group-hover/link:scale-100 rounded-full z-0",
                    theme === "light" ? "bg-black/5" : "bg-white/10"
                  )} />
                  {pathname === item.href && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                  )}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>

          {status === "authenticated" && user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={ROUTES.profile}
                className={cn(
                  "hidden lg:block text-sm font-medium hover:text-accent transition-colors",
                  theme === "light" ? "text-black/70" : "text-white/70"
                )}
              >
                Profile
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className={cn(
                  "rounded-full transition-all duration-300",
                  theme === "light"
                    ? "border-black/10 hover:bg-black/5"
                    : "border-white/10 hover:bg-white/5"
                )}
              >
                {t("nav.signOut")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth?mode=sign-in" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-accent/10 transition-colors"
                >
                  {t("nav.signIn")}
                </Button>
              </Link>
              <Link href="/auth?mode=sign-up">
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-white rounded-full px-5 shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
                >
                  {t("nav.getStarted")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "md:hidden p-2 rounded-full transition-colors",
              theme === "light" ? "hover:bg-black/5" : "hover:bg-white/5"
            )}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
              <span className={cn(
                "h-0.5 w-5 bg-current rounded-full transition-all duration-300",
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              )} />
              <span className={cn(
                "h-0.5 w-5 bg-current rounded-full transition-all duration-300",
                isMenuOpen ? "opacity-0" : ""
              )} />
              <span className={cn(
                "h-0.5 w-5 bg-current rounded-full transition-all duration-300",
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              )} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className={cn(
            "absolute top-full left-0 right-0 mt-4 mx-2 p-6 rounded-3xl border md:hidden animate-in-scale",
            "backdrop-blur-3xl shadow-2xl",
            theme === "light"
              ? "bg-white/95 border-black/5 shadow-black/10"
              : "bg-slate-900/95 border-white/5 shadow-black/50"
          )}>
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-lg font-medium py-2 px-4 rounded-xl transition-colors",
                    pathname === item.href
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="h-[1px] bg-foreground/10 my-2" />

              <div className="flex items-center justify-between px-4 pb-2">
                <span className="text-sm font-medium opacity-60">Preferences</span>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
              </div>

              {status === "authenticated" ? (
                <Button
                  variant="outline"
                  className="w-full rounded-2xl py-6"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  {t("nav.signOut")}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Link href="/auth?mode=sign-in" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-2xl py-6">
                      {t("nav.signIn")}
                    </Button>
                  </Link>
                  <Link href="/auth?mode=sign-up" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-accent text-white rounded-2xl py-6">
                      {t("nav.getStarted")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
