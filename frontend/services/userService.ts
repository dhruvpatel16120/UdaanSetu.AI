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
  analysis?: any;
  generated_bio?: {
    ai_report?: any;
    snapshot?: {
      top_recommendation?: string;
    };
  };
}

export const userService = {
  async getProfile(uid: string, firebaseId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${ENV.apiUrl}/api/user/me`, {
        headers: { "X-Firebase-Id": firebaseId }
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  async getAssessmentResult(uid: string): Promise<AssessmentResult | null> {
    try {
      const response = await fetch(`${ENV.apiUrl}/api/assessment/result/${uid}`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error("Error fetching assessment result:", error);
      return null;
    }
  },

  async getCareerReport(uid: string): Promise<any | null> {
    try {
      const response = await fetch(`${ENV.apiUrl}/api/assessment/report/${uid}`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error("Error fetching career report:", error);
      return null;
    }
  }
};
