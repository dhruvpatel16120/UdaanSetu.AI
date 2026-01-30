import { ENV } from "@/constants/env";

export interface UserProfile {
  name?: string;
  displayName?: string;
  profile?: {
    location?: string;
    education?: string;
  };
  email?: string;
}

export interface AssessmentResult {
  status: string;
  analysis?: unknown;
  generated_bio?: {
    ai_report?: unknown;
    snapshot?: {
      top_recommendation?: string;
    };
  };
}

import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/services/firebase/client"; // Correct import

const getAuthToken = async () => {
  const app = getFirebaseApp(); // Get app instance
  const auth = getAuth(app);
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export const userService = {
  async getProfile(): Promise<UserProfile | null> {
    try {
      const token = await getAuthToken();
      if (!token) return null;
      
      const response = await fetch(`${ENV.apiUrl}/api/user/me`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  async getAssessmentResult(uid: string): Promise<AssessmentResult | null> {
    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${ENV.apiUrl}/api/assessment/result/${uid}`, { headers });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error("Error fetching assessment result:", error);
      return null;
    }
  },

  async getCareerReport(uid: string): Promise<unknown | null> {
    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENV.apiUrl}/api/assessment/report/${uid}`, { headers });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error("Error fetching career report:", error);
      return null;
    }
  }
};
