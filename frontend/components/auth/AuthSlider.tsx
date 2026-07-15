"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { LanguageToggle } from "@/components/LanguageToggle/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TextField } from "@/components/forms/TextField";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { InlineLink } from "@/components/ui/InlineLink";
import { Spinner } from "@/components/ui/Spinner";

import { ROUTES } from "@/constants/routes";
import { AUTH_THEME } from "@/constants/theme";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useI18n } from "@/hooks/useI18n";
import { authService } from "@/services/auth/authService";
import { mapAuthErrorToMessageKey } from "@/utils/mapAuthErrorToMessageKey";
import { cn } from "@/utils/cn";

type Mode = "sign-in" | "sign-up";

type SignInFormState = {
  email: string;
  password: string;
};

type SignUpFormState = {
  email: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_SIGN_IN: SignInFormState = { email: "", password: "" };
const INITIAL_SIGN_UP: SignUpFormState = { email: "", password: "", confirmPassword: "" };

function parseMode(value: string | null): Mode {
  return value === "sign-up" ? "sign-up" : "sign-in";
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

type PasswordStrength = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecial: boolean;
};

function getPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

function isStrongPassword(password: string): boolean {
  const s = getPasswordStrength(password);
  return s.hasMinLength && s.hasUppercase && s.hasLowercase && s.hasSpecial;
}

const MODE_LABELS: Record<Mode, { titleKey: "auth.title.signIn" | "auth.title.signUp" }> = {
  "sign-in": { titleKey: "auth.title.signIn" },
  "sign-up": { titleKey: "auth.title.signUp" },
} as const;

export function AuthSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const initialMode = useMemo(() => parseMode(searchParams.get("mode")), [searchParams]);
  const [mode, setMode] = useState<Mode>(initialMode);

  const signInAction = useAsyncAction();
  const signUpAction = useAsyncAction();

  const [signIn, setSignIn] = useState<SignInFormState>(INITIAL_SIGN_IN);
  const [signUp, setSignUp] = useState<SignUpFormState>(INITIAL_SIGN_UP);
  const [signUpLocalError, setSignUpLocalError] = useState<string | null>(null);

  const setUrlMode = useCallback(
    (next: Mode) => {
      setMode(next);
      signInAction.resetError();
      signUpAction.resetError();
      setSignUpLocalError(null);
      router.replace(`${ROUTES.auth.root}?mode=${next}`);
    },
    [router, signInAction, signUpAction],
  );

  const onSwitchToSignIn = useCallback(() => setUrlMode("sign-in"), [setUrlMode]);
  const onSwitchToSignUp = useCallback(() => setUrlMode("sign-up"), [setUrlMode]);

  const signInErrorKey = useMemo(() => {
    if (!signInAction.error) return null;
    return mapAuthErrorToMessageKey(signInAction.error);
  }, [signInAction.error]);

  const signUpErrorKey = useMemo(() => {
    if (signUpLocalError) return null;
    if (!signUpAction.error) return null;
    return mapAuthErrorToMessageKey(signUpAction.error);
  }, [signUpAction.error, signUpLocalError]);

  const activeErrorKey = useMemo(() => {
    if (mode === "sign-in") return signInErrorKey;
    return signUpLocalError ? null : signUpErrorKey;
  }, [mode, signInErrorKey, signUpErrorKey, signUpLocalError]);

  const messageVariant = useMemo(() => {
    if (!activeErrorKey) return null;
    return activeErrorKey === "auth.error.popupClosed" ? "info" : "error";
  }, [activeErrorKey]);

  const messageText = useMemo(() => (activeErrorKey ? t(activeErrorKey) : null), [activeErrorKey, t]);

  const onSignInSubmit = useCallback(async () => {
    await signInAction.run(async () => {
      if (!isValidEmail(signIn.email.trim())) {
        throw new Error("auth/invalid-email");
      }

      const credential = await authService.signInWithEmailPassword(signIn.email.trim(), signIn.password);

      if (!credential.user.emailVerified) {
        router.push(ROUTES.auth.verifyEmail);
        throw { code: "auth/unverified-email" };
      }

      router.push(ROUTES.home);
    });
  }, [router, signIn.email, signIn.password, signInAction]);

  const onSignUpSubmit = useCallback(async () => {
    if (!isValidEmail(signUp.email.trim())) {
      setSignUpLocalError(t("auth.error.invalidEmail"));
      return;
    }

    if (!isStrongPassword(signUp.password)) {
      setSignUpLocalError("Password must be at least 8 characters and include uppercase, lowercase, and a special character.");
      return;
    }

    if (signUp.password !== signUp.confirmPassword) {
      setSignUpLocalError(t("auth.error.passwordMismatch"));
      return;
    }

    await signUpAction.run(async () => {
      await authService.signUpWithEmailPassword(signUp.email.trim(), signUp.password);
      router.push(ROUTES.auth.verifyEmail);
    });
  }, [router, signUp.confirmPassword, signUp.email, signUp.password, signUpAction, t]);

  const onGoogle = useCallback(async () => {
    const runner = mode === "sign-in" ? signInAction : signUpAction;
    await runner.run(async () => {
      await authService.signInWithGooglePopup();
      router.push(ROUTES.home);
    });
  }, [mode, router, signInAction, signUpAction]);

  const canSignIn = useMemo(
    () => signIn.email.trim().length > 0 && signIn.password.length > 0,
    [signIn.email, signIn.password],
  );

  const canSignUp = useMemo(
    () => signUp.email.trim().length > 0 && signUp.password.length > 0 && signUp.confirmPassword.length > 0,
    [signUp.confirmPassword, signUp.email, signUp.password],
  );

  const isBusy = useMemo(
    () => signInAction.isLoading || signUpAction.isLoading,
    [signInAction.isLoading, signUpAction.isLoading],
  );

  const containerShiftClass = useMemo(
    () => (mode === "sign-up" ? "md:-translate-x-1/2" : "md:translate-x-0"),
    [mode],
  );

  return (
    <div className={cn("min-h-screen", AUTH_THEME.backgroundClass)}>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full">
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <div className="flex items-center gap-3">
              <Link href={ROUTES.home} className="relative h-10 w-10 block hover:opacity-80 transition-opacity">
                <Image src="/logo.png" alt={t("appName")} fill className="object-contain" priority sizes="40px" />
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
                    {t(MODE_LABELS[mode].titleKey)}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(mode === "sign-in" ? "auth.subtitle.signIn" : "auth.subtitle.signUp")}
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-2 rounded-2xl border border-zinc-200 bg-white/60 p-1 text-sm dark:border-white/10 dark:bg-white/5 md:hidden">
                  <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    disabled={isBusy}
                    className={cn(
                      "h-10 rounded-xl font-medium transition-colors",
                      mode === "sign-in"
                        ? "bg-white text-foreground shadow-sm dark:bg-white/15"
                        : "text-muted-foreground hover:text-foreground dark:hover:text-white",
                    )}
                  >
                    {t("auth.title.signIn")}
                  </button>
                  <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    disabled={isBusy}
                    className={cn(
                      "h-10 rounded-xl font-medium transition-colors",
                      mode === "sign-up"
                        ? "bg-white text-foreground shadow-sm dark:bg-white/15"
                        : "text-muted-foreground hover:text-foreground dark:hover:text-white",
                    )}
                  >
                    {t("auth.title.signUp")}
                  </button>
                </div>

                {messageText && messageVariant ? (
                  <Alert variant={messageVariant} description={messageText} className="mb-6" />
                ) : null}

                <div className="relative">
                  <div
                    className={cn(
                      "flex w-full transition-transform duration-500 ease-out md:w-[200%]",
                      containerShiftClass,
                    )}
                  >
                    <div className={cn("w-full md:w-1/2 md:pr-8", mode === "sign-up" ? "hidden md:block" : "block")}>
                      <div className="flex flex-col gap-4">
                        <TextField
                          id="signInEmail"
                          label={t("auth.field.email")}
                          value={signIn.email}
                          onChange={(e) => {
                            signInAction.resetError();
                            setSignIn((prev) => ({ ...prev, email: e.target.value }));
                          }}
                          autoComplete="email"
                          inputMode="email"
                        />
                        <TextField
                          id="signInPassword"
                          label={t("auth.field.password")}
                          type="password"
                          value={signIn.password}
                          onChange={(e) => {
                            signInAction.resetError();
                            setSignIn((prev) => ({ ...prev, password: e.target.value }));
                          }}
                          autoComplete="current-password"
                        />
                      </div>

                      <div className="mt-6 flex flex-col gap-3">
                        <Button type="button" onClick={onSignInSubmit} disabled={!canSignIn || isBusy}>
                          {signInAction.isLoading ? (
                            <>
                              <Spinner />
                              {t("auth.action.signIn")}
                            </>
                          ) : (
                            t("auth.action.signIn")
                          )}
                        </Button>

                        <div className="flex justify-start text-sm text-muted-foreground">
                          <InlineLink href={ROUTES.auth.forgotPassword}>{t("auth.title.forgotPassword")}</InlineLink>
                        </div>

                        <AuthDivider label={t("auth.divider.or")} />

                        <Button type="button" variant="outline" onClick={onGoogle} disabled={isBusy}>
                          {signInAction.isLoading ? (
                            <>
                              <Spinner />
                              {t("auth.action.google")}
                            </>
                          ) : (
                            <>
                              <GoogleIcon className="h-4 w-4" />
                              {t("auth.action.google")}
                            </>
                          )}
                        </Button>

                        <div className="flex justify-center text-sm text-muted-foreground mt-2">
                          <Link href={ROUTES.home} className="hover:text-foreground dark:hover:text-zinc-300 transition-colors flex items-center gap-1 group">
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {t("auth.link.backToHome")}
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className={cn("mt-10 w-full md:mt-0 md:w-1/2 md:pl-8", mode === "sign-in" ? "hidden md:block" : "block")}>
                      <div className="flex flex-col gap-4">
                        <TextField
                          id="signUpEmail"
                          label={t("auth.field.email")}
                          value={signUp.email}
                          onChange={(e) => {
                            signUpAction.resetError();
                            setSignUpLocalError(null);
                            setSignUp((prev) => ({ ...prev, email: e.target.value }));
                          }}
                          autoComplete="email"
                          inputMode="email"
                        />
                        <TextField
                          id="signUpPassword"
                          label={t("auth.field.password")}
                          type="password"
                          value={signUp.password}
                          onChange={(e) => {
                            signUpAction.resetError();
                            setSignUpLocalError(null);
                            setSignUp((prev) => ({ ...prev, password: e.target.value }));
                          }}
                          autoComplete="new-password"
                        />
                        {/* Password strength checklist — shown while user is typing */}
                        {signUp.password.length > 0 && (() => {
                          const s = getPasswordStrength(signUp.password);
                          const rules: { label: string; met: boolean }[] = [
                            { label: "At least 8 characters", met: s.hasMinLength },
                            { label: "Uppercase letter (A-Z)", met: s.hasUppercase },
                            { label: "Lowercase letter (a-z)", met: s.hasLowercase },
                            { label: "Special character (!@#$…)", met: s.hasSpecial },
                          ];
                          const metCount = rules.filter((r) => r.met).length;
                          const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400"];
                          return (
                            <div className="mt-2 space-y-2">
                              {/* Strength bar */}
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "h-1.5 flex-1 rounded-full transition-all duration-300",
                                      i < metCount ? strengthColors[metCount - 1] : "bg-zinc-200 dark:bg-white/10",
                                    )}
                                  />
                                ))}
                              </div>
                              {/* Rule checklist */}
                              <ul className="space-y-1">
                                {rules.map((rule) => (
                                  <li
                                    key={rule.label}
                                    className={cn(
                                      "flex items-center gap-2 text-xs transition-colors",
                                      rule.met ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500",
                                    )}
                                  >
                                    {rule.met ? (
                                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                                      </svg>
                                    )}
                                    {rule.label}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                        <TextField
                          id="signUpConfirmPassword"
                          label={t("auth.field.confirmPassword")}
                          type="password"
                          value={signUp.confirmPassword}
                          onChange={(e) => {
                            signUpAction.resetError();
                            setSignUpLocalError(null);
                            setSignUp((prev) => ({ ...prev, confirmPassword: e.target.value }));
                          }}
                          autoComplete="new-password"
                        />
                      </div>

                      {signUpLocalError ? (
                        <Alert variant="error" description={signUpLocalError} className="mt-6" />
                      ) : null}

                      <div className="mt-6 flex flex-col gap-3">
                        <Button type="button" onClick={onSignUpSubmit} disabled={!canSignUp || isBusy}>
                          {signUpAction.isLoading ? (
                            <>
                              <Spinner />
                              {t("auth.action.signUp")}
                            </>
                          ) : (
                            t("auth.action.signUp")
                          )}
                        </Button>

                        <AuthDivider label={t("auth.divider.or")} />

                        <Button type="button" variant="outline" onClick={onGoogle} disabled={isBusy}>
                          {signUpAction.isLoading ? (
                            <>
                              <Spinner />
                              {t("auth.action.google")}
                            </>
                          ) : (
                            <>
                              <GoogleIcon className="h-4 w-4" />
                              {t("auth.action.google")}
                            </>
                          )}
                        </Button>

                        <div className="flex justify-center text-sm text-muted-foreground mt-2">
                          <Link href={ROUTES.home} className="hover:text-foreground dark:hover:text-zinc-300 transition-colors flex items-center gap-1 group">
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {t("auth.link.backToHome")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                        <Image src="/logo.png" alt={t("appName")} fill className="object-contain" sizes="48px" />
                      </Link>
                      <Link href={ROUTES.home} className="text-2xl font-bold tracking-tight hover:text-white/80 transition-colors">{t("appName")}</Link>
                    </div>
                    <p className="mt-6 max-w-sm text-base leading-7 text-white/90 drop-shadow-sm">
                      {t("auth.brand.tagline")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="text-sm text-white/80">
                      {mode === "sign-in" ? t("auth.link.noAccount") : t("auth.link.haveAccount")}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={mode === "sign-in" ? onSwitchToSignUp : onSwitchToSignIn}
                      disabled={isBusy}
                      className="w-fit bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm"
                    >
                      {mode === "sign-in" ? t("auth.action.signUp") : t("auth.action.signIn")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 md:hidden">
            <span>{mode === "sign-in" ? t("auth.link.noAccount") : t("auth.link.haveAccount")}</span>
            <button
              type="button"
              onClick={mode === "sign-in" ? onSwitchToSignUp : onSwitchToSignIn}
              className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
              disabled={isBusy}
            >
              {mode === "sign-in" ? t("auth.action.signUp") : t("auth.action.signIn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
