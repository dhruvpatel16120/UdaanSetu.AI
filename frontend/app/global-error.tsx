'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 text-center">
             <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
             <p className="max-w-[500px] text-gray-500 dark:text-gray-400">
              A critical error occurred. Please try refreshing the page.
            </p>
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => reset()}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
