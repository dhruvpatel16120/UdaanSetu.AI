"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LanguageToggle } from "@/components/LanguageToggle/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

import { AUTH_THEME } from "@/constants/theme";
import { ROUTES } from "@/constants/routes";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { authService } from "@/services/auth/authService";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, refreshUser, signOut, status } = useAuth();
  const { isLoading, error, run, resetError } = useAsyncAction();

  const [resendCount, setResendCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_verify_email_resend_count");
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  // Only redirect after Firebase has resolved the auth state.
  // Without this check, user is null on first render (loading state)
  // and the effect immediately kicks the user back to sign-in.
  useEffect(() => {
    if (status !== "loading" && !user) {
      router.replace(ROUTES.auth.signIn);
    }
  }, [router, user, status]);

  const title = useMemo(() => t("auth.title.verifyEmail"), [t]);
  const subtitle = useMemo(() => t("auth.subtitle.verifyEmail"), [t]);

  // Extract a human-readable error message from the thrown value
  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null && "message" in error) {
      return String((error as { message: unknown }).message);
    }
    return t("auth.error.generic");
  }, [error, t]);

  const onResend = useCallback(async () => {
    if (resendCount >= 3) {
      toast.error("You have reached the limit of 3 verification email requests. Please check your spam folder or try again later.");
      return;
    }

    resetError();
    await run(async () => {
      await authService.resendVerificationEmail();
      const newCount = resendCount + 1;
      setResendCount(newCount);
      localStorage.setItem("auth_verify_email_resend_count", newCount.toString());
      toast.success(`Verification email sent successfully! (${newCount}/3 requests used)`);
    });
  }, [resendCount, resetError, run]);

  const onCheck = useCallback(async () => {
    resetError();
    await run(async () => {
      const refreshed = await authService.refreshUser();
      if (refreshed?.emailVerified) {
        toast.success("Email verified successfully! Opening Dashboard...");
        await refreshUser();
        router.replace(ROUTES.dashboard);
      } else {
        toast.error("Email is not verified yet. Please check your inbox or spam folder.");
      }
    });
  }, [refreshUser, resetError, run, router]);

  const infoMessage = useMemo(() => {
    if (!user?.email) {
      return null;
    }

    return `${t("auth.hint.checkYourEmail")} (${user.email})`;
  }, [t, user]);

  return (
    <div className={cn("min-h-screen", AUTH_THEME.backgroundClass)}>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <div className="flex items-center gap-3">
              <Link href={ROUTES.home} className="relative h-10 w-10 block hover:opacity-80 transition-opacity">
                <Image src="/logo.png" alt={t("appName")} fill className="object-contain" priority />
              </Link>
              <Link href={ROUTES.home} className="text-lg font-semibold tracking-tight text-foreground hover:text-accent transition-colors">
                {t("appName")}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          <Card
            className={cn(
              "relative overflow-hidden rounded-3xl border shadow-2xl",
              AUTH_THEME.cardBorderClass,
              AUTH_THEME.cardBgClass,
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 sm:p-8">
                <div className="mb-5 sm:mb-6">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
                </div>

                {infoMessage ? <Alert variant="info" description={infoMessage} className="mb-6" /> : null}
                {errorMessage ? <Alert variant="error" description={errorMessage} className="mb-6" /> : null}

                <div className="flex flex-col gap-3">
                  <Button type="button" onClick={onCheck} disabled={isLoading || status === "loading"}>
                    {isLoading ? (
                      <>
                        <Spinner />
                        {t("auth.action.checkVerification")}
                      </>
                    ) : (
                      t("auth.action.checkVerification")
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onResend} disabled={isLoading || resendCount >= 3 || status === "loading"}>
                    {isLoading ? (
                      <>
                        <Spinner />
                        {t("auth.action.resendVerification")}
                      </>
                    ) : resendCount >= 3 ? (
                      "Resend Limit Reached (3/3)"
                    ) : (
                      `${t("auth.action.resendVerification")}${resendCount > 0 ? ` (${resendCount}/3)` : ""}`
                    )}
                  </Button>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex justify-center text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={async () => {
                        await signOut();
                      }}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-300 font-medium underline underline-offset-4 transition-colors"
                    >
                      {t("auth.action.signIn")}
                    </button>
                  </div>

                  <div className="flex justify-center text-sm text-muted-foreground pt-2 border-t border-zinc-200 dark:border-white/10">
                    <Link href={ROUTES.home} className="hover:text-foreground dark:hover:text-zinc-300 transition-colors flex items-center gap-1 group">
                      <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      {t("auth.link.backToHome")}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side Image Panel - Desktop Only */}
              <div className={cn("relative hidden md:block overflow-hidden", AUTH_THEME.accentBgClass)}>
                <div className="absolute inset-0" aria-hidden="true">
                  <Image
                    src="/auth-hero.png"
                    alt=""
                    fill
                    className="object-cover opacity-30"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/70" />
                </div>
                <div className="relative flex h-full flex-col justify-between p-10 text-white">
                  <div>
                    <div className="flex items-center gap-3">
                      <Link href={ROUTES.home} className="relative h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm p-2.5 block hover:bg-white/20 transition-colors">
                        <Image src="/logo.png" alt={t("appName")} fill className="object-contain" />
                      </Link>
                      <Link href={ROUTES.home} className="text-2xl font-bold tracking-tight hover:text-white/80 transition-colors">{t("appName")}</Link>
                    </div>
                    <p className="mt-6 max-w-sm text-base leading-7 text-white/90 drop-shadow-sm">
                      {t("auth.brand.tagline")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="text-sm text-white/80">
                      {t("auth.link.haveAccount")}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        await signOut();
                      }}
                      className="w-fit bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm"
                    >
                      {t("auth.action.signIn")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
