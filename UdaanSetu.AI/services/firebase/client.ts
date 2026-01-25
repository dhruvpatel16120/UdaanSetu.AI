import { ENV } from "@/constants/env";
import { initializeApp, type FirebaseApp, getApps } from "firebase/app";

export const hasFirebaseConfig = (config: typeof ENV.firebase) =>
  Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId,
  );

export function getFirebaseAppSafe(): FirebaseApp | null {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  if (!hasFirebaseConfig(ENV.firebase)) {
    return null;
  }

  return initializeApp({
    apiKey: ENV.firebase.apiKey,
    authDomain: ENV.firebase.authDomain,
    projectId: ENV.firebase.projectId,
    storageBucket: ENV.firebase.storageBucket,
    messagingSenderId: ENV.firebase.messagingSenderId,
    appId: ENV.firebase.appId,
  });
}

export function getFirebaseApp(): FirebaseApp {
  const app = getFirebaseAppSafe();
  if (!app) {
    throw new Error(
      "Firebase config missing. Set NEXT_PUBLIC_FIREBASE_* env vars in .env.local.",
    );
  }

  return app;
}
