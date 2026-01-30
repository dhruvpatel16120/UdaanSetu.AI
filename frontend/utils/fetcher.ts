import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/services/firebase/client";

export const apiFetcher = async (url: string) => {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const user = auth.currentUser;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as Error & { info?: unknown; status?: number };
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};
