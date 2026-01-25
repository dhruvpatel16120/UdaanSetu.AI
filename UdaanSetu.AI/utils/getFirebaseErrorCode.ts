export function getFirebaseErrorCode(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const maybeCode = (error as { code?: unknown }).code;
    return typeof maybeCode === "string" ? maybeCode : null;
  }

  return null;
}
