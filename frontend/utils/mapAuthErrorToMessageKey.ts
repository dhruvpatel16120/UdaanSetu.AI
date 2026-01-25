import type { TranslationKey } from "@/types/i18n";
import { getFirebaseErrorCode } from "@/utils/getFirebaseErrorCode";

export function mapAuthErrorToMessageKey(error: unknown): TranslationKey {
  const code = getFirebaseErrorCode(error);

  if (!code) {
    return "auth.error.generic";
  }

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    return "auth.error.invalidCredentials";
  }

  if (code === "auth/popup-closed-by-user") {
    return "auth.error.popupClosed";
  }

  if (code === "auth/invalid-email") {
    return "auth.error.invalidEmail";
  }

  return "auth.error.generic";
}
