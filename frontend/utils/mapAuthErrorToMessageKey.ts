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

  if (code === "auth/email-already-in-use") {
    return "auth.error.emailInUse";
  }

  if (code === "auth/network-request-failed") {
    return "auth.error.network";
  }

  if (code === "auth/too-many-requests") {
    return "auth.error.tooManyRequests";
  }

  if (code === "auth/user-disabled") {
    return "auth.error.userDisabled";
  }

  if (code === "auth/weak-password") {
    return "auth.error.weakPassword";
  }

  if (code === "auth/operation-not-allowed") {
    return "auth.error.operationNotAllowed";
  }

  return "auth.error.generic";
}
