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
import { InlineLink } from "@/components/ui/InlineLink";
import { Spinner } from "@/components/ui/Spinner";
import { ASSETS } from "@/constants/assets";
import { AUTH_THEME } from "@/constants/theme";
import { ROUTES } from "@/constants/routes";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { authService } from "@/services/auth/authService";
import { cn } from "@/utils/cn";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, refreshUser } = useAuth();
  const { isLoading, error, run, resetError } = useAsyncAction();

  const [justChecked, setJustChecked] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      router.replace(ROUTES.auth.signIn);
    }
  }, [router, user]);

  const title = useMemo(() => t("auth.title.verifyEmail"), [t]);
  const subtitle = useMemo(() => t("auth.subtitle.verifyEmail"), [t]);

  const onResend = useCallback(async () => {
    resetError();
    await run(async () => {
      await authService.resendVerificationEmail();
    });
  }, [resetError, run]);

  const onCheck = useCallback(async () => {
    resetError();
    await run(async () => {
      await refreshUser();
      setJustChecked(true);
    });
  }, [refreshUser, resetError, run]);

  useEffect(() => {
    if (!justChecked) {
      return;
    }

    if (user?.emailVerified) {
      router.replace(ROUTES.home);
    }
  }, [justChecked, router, user?.emailVerified]);

  const infoMessage = useMemo(() => {
    if (!user?.email) {
      return null;
    }

    return `${t("auth.hint.checkYourEmail")} (${user.email})`;
  }, [t, user?.email]);

  return (
    <div className={cn("min-h-screen", AUTH_THEME.backgroundClass)}>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <div className="flex items-center gap-3">
              <Link href={ROUTES.home} className="relative h-10 w-10 block hover:opacity-80 transition-opacity">
                <Image src={ASSETS.logo} alt={t("appName")} fill className="object-contain" priority />
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
                {error ? <Alert variant="error" description={t("auth.error.generic")} className="mb-6" /> : null}

                <div className="flex flex-col gap-3">
                  <Button type="button" onClick={onCheck} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner />
                        {t("auth.action.checkVerification")}
                      </>
                    ) : (
                      t("auth.action.checkVerification")
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onResend} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner />
                        {t("auth.action.resendVerification")}
                      </>
                    ) : (
                      t("auth.action.resendVerification")
                    )}
                  </Button>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex justify-center text-sm text-muted-foreground">
                    <InlineLink href={ROUTES.auth.signIn}>{t("auth.action.signIn")}</InlineLink>
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
                    src={ASSETS.authHero}
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
                        <Image src={ASSETS.logo} alt={t("appName")} fill className="object-contain" />
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
                      onClick={() => router.push(ROUTES.auth.signIn)}
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
