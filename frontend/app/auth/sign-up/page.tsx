"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${ROUTES.auth.root}?mode=sign-up`);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-500"></div>
    </div>
  );
}
