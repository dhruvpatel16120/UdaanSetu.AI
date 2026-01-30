import useSWR from 'swr';
import { apiFetcher } from '@/utils/fetcher';
import { ENV } from '@/constants/env';

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
    status?: string;
    analysis?: {
        basic_info?: {
            name?: string;
            education?: string;
            location?: string;
        };
        career_paths?: Array<{ title: string }>;
        top_skills_recommended?: string[];
        user_current_skills?: string[];
    };
    generated_bio?: {
      readiness_score?: number;
      trait_scores?: Record<string, number>;
      snapshot?: {
        key_insights?: Array<{ en: string; gu: string }>;
        top_recommendation?: { en: string; gu: string } | string;
      };
      bio_texts?: { en: string; gu: string };
      swot?: {
        strengths: Array<{ en: string; gu: string }>;
        weaknesses: Array<{ en: string; gu: string }>;
        opportunities: Array<{ en: string; gu: string }>;
        threats: Array<{ en: string; gu: string }>;
      };
    };
}

export interface CareerReport {
    careerReadiness?: number;
    topStrengths?: string[];
    personalityTraits?: string[];
    recommendations?: Array<{
        title: string;
        match: number;
        description: string;
        requirements: string[];
    }>;
    currentSkills?: Array<{
        name: string;
        level: number;
    }>;
    recommendedSkills?: Array<{
        name: string;
        priority: "high" | "medium" | "low";
    }>;
    learningPaths?: Array<{
        title: string;
        duration: string;
        resources: Array<{ name: string; url: string }>;
    }>;
    actionPlan?: {
        shortTerm: string[];
        longTerm: string[];
    };
}

export function useProfile() {
  return useSWR<UserProfile>(`${ENV.apiUrl}/api/user/me`, apiFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
}

export function useAssessmentResult(uid: string | undefined) {
  return useSWR<AssessmentResult>(
    uid ? `${ENV.apiUrl}/api/assessment/result/${uid}` : null,
    apiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
}

export function useCareerReport(uid: string | undefined) {
  return useSWR<CareerReport>(
    uid ? `${ENV.apiUrl}/api/assessment/report/${uid}` : null,
    apiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
}
