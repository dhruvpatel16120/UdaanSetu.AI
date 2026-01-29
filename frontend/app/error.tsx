'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="max-w-[500px] text-gray-500 dark:text-gray-400">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
      </div>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        variant="primary"
      >
        Try again
      </Button>
    </div>
  );
}
