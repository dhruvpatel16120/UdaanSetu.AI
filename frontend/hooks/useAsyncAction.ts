"use client";

import { useCallback, useState } from "react";

type AsyncState = {
  isLoading: boolean;
  error: unknown | null;
};

export function useAsyncAction() {
  const [state, setState] = useState<AsyncState>({ isLoading: false, error: null });

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const run = useCallback(async <T,>(action: () => Promise<T>) => {
    setState({ isLoading: true, error: null });
    try {
      const result = await action();
      setState({ isLoading: false, error: null });
      return result;
    } catch (err) {
      setState({ isLoading: false, error: err });
      throw err;
    }
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    resetError,
    run,
  };
}
