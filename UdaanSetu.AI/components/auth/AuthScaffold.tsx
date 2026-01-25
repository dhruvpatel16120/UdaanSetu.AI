"use client";

import type { ReactNode } from "react";

import { LanguageToggle } from "@/components/LanguageToggle/LanguageToggle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";

type AuthScaffoldProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScaffold({ title, subtitle, children, footer }: AuthScaffoldProps) {
  const { t } = useI18n();

  const appName = t("appName");
  const tagline = t("auth.brand.tagline");

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-black">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 md:grid-cols-2">
        <div className="hidden flex-col gap-6 md:flex">
          <div className="inline-flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-foreground" aria-hidden="true" />
            <div className="text-xl font-semibold tracking-tight">{appName}</div>
          </div>
          <p className="max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {tagline}
          </p>
        </div>

        <div className="w-full">
          <div className="mb-6 flex items-center justify-end">
            <LanguageToggle />
          </div>

          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {title}
                </h1>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{subtitle}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">{children}</div>
              {footer ? <div className="mt-6">{footer}</div> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
