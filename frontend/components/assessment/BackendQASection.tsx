"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { BasicInfoForm } from "@/components/assessment/BasicInfoForm";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";

// Types matching the Backend Response
interface BackendOption {
  id: string;
  text: { en: string; gu: string };
  traits?: Record<string, any>;
}

interface BackendQuestion {
  id: string;
  section: string;
  type: string;
  text: { en: string; gu: string };
  options?: BackendOption[];
  next_question_id?: string;
}

interface AssessmentData {
  background: Record<string, string | number>;
  answers: Record<string, string>;
}

export function BackendQASection() {
  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showBasicInfoForm, setShowBasicInfoForm] = useState(true);

  // We'll store the basic info and subsequent answers here
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    background: {},
    answers: {}
  });

  const [isCompleted, setIsCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { language, t } = useI18n();
  const router = useRouter();

  // Fetch Questions from Backend
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/assessment/questions');
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data: BackendQuestion[] = await res.json();

        // Filter out Static Layer if we are using BasicInfoForm
        // Adjust this logic if you want the backend to drive everything.
        // For now, removing questions that appear to be static to avoid duplication.
        const dynamicQuestions = data.filter(q => q.section !== 'Static Layer');

        setQuestions(dynamicQuestions);
      } catch (err) {
        setError('Could not load assessment questions. Make sure the backend is running on port 8000.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (!showBasicInfoForm) {
      fetchQuestions();
    }
  }, [showBasicInfoForm]);

  // If questions define a "next_question_id", we could use that for navigation.
  // For this list-based implementation, we just use index.
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const getText = (textObj: { en: string; gu: string } | undefined) => {
    if (!textObj) return "";
    return language === "gu" ? textObj.gu : textObj.en;
  };

  const handleBasicInfoSubmit = (info: any) => {
    setAssessmentData(prev => ({
      ...prev,
      background: { ...info }
    }));
    setShowBasicInfoForm(false);
  };

  const handleAnswer = (optionId: string) => {
    // Save locally
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Update main data structure
    setAssessmentData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const submitAssessment = async () => {
    setLoading(true);
    try {
      // Format answers for backend
      // Backend expects: List[Answer] where Answer = { question_id, selected_option_id, text_answer }
      const payload = Object.entries(answers).map(([qId, optId]) => ({
        question_id: qId,
        selected_option_id: optId
      }));

      // In a real app, send background info too if needed by backend, 
      // or backend should have asked for it. 
      // Current backend endpoint /submit just takes answers list.

      const res = await fetch('http://localhost:8000/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Submission failed');
      const result = await res.json();
      console.log('Assessment Result:', result);

      setIsCompleted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      // Last question - Submit
      submitAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleRestart = () => {
    setShowBasicInfoForm(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
    setQuestions([]);
  };

  if (showBasicInfoForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-in-scale">
        <BasicInfoForm onSubmit={handleBasicInfoSubmit} />
      </div>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] animate-in-scale">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-4 border-primary-indigo rounded-full animate-spin animation-delay-200"></div>
        </div>
        <p className="mt-6 text-xl font-medium text-foreground/80 animate-pulse">Loading Assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-12 glass-card max-w-md w-full animate-in-scale border-destructive/30 shadow-2xl">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">Something went wrong</h3>
          <p className="text-foreground/70 mb-6">{error}</p>
          <Button onClick={handleRestart} className="w-full shadow-lg hover:shadow-xl transition-all">Retry Connection</Button>
        </div>
      </div>
    );
  }

  // Add router for redirection

  if (isCompleted) {
    // Redirect to report immediately or show a brief success message then redirect
    // For "perfect" UX, let's show a Success Animation briefly then push.
    setTimeout(() => {
      router.push('/career-report');
    }, 2000);

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-slide-up">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-teal"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-indigo/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center mx-auto mb-8 glow-teal animate-float shadow-xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-indigo via-accent-cyan to-accent-teal bg-clip-text text-transparent animate-gradient">
              {t("assessment.completedTitle") || "Assessment Complete!"}
            </h2>

            <p className="text-xl text-foreground/80 mb-6 max-w-2xl mx-auto leading-relaxed">
              {t("assessment.analyzing") || "Generating your personalized Career Report..."}
            </p>

            {/* Loading Indicator for Redirection */}
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center p-8">No questions available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      {/* Progress Section */}
      <div className="mb-10 animate-slide-up">
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className="text-xs font-bold tracking-wider text-accent uppercase">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <div className="h-1 w-12 bg-accent mt-1 rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-foreground/80">
            {Math.round(progress)}<span className="text-base text-foreground/40">%</span>
          </span>
        </div>

        {/* Advanced Progress Bar */}
        <div className="w-full bg-foreground/5 rounded-full h-3 p-0.5 shadow-inner backdrop-blur-sm">
          <div
            className="bg-gradient-to-r from-accent to-accent-teal h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(20,184,166,0.3)] relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-md mr-1 opacity-70"></div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className={cn(
        "glass-card p-8 sm:p-10 transition-all duration-500 relative overflow-hidden shadow-2xl border-t border-white/20",
        isTransitioning ? "opacity-0 transform translate-x-8 scale-95" : "opacity-100 transform translate-x-0 scale-100"
      )}>
        {/* Background glow for card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-indigo/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        {/* Category Badge */}
        <div className="flex items-center justify-between mb-8">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-primary-indigo/10 text-primary-indigo border border-primary-indigo/20 shadow-sm backdrop-blur-md">
            {/* Icon could go here */}
            {currentQuestion.section}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-foreground leading-tight tracking-tight">
          {getText(currentQuestion.text)}
        </h2>

        {/* Dynamic Input Area */}
        <div className="space-y-4">
          {currentQuestion.type === "text" || currentQuestion.type === "date" ? (
            <div className="space-y-4 animate-in-scale delay-100">
              <div className="group relative">
                <input
                  type={currentQuestion.type === "date" || currentQuestion.id.includes("dob") ? "date" : "text"}
                  className="w-full p-6 text-lg rounded-2xl border-2 border-border/30 bg-background/50 text-foreground outline-none focus:border-accent focus:bg-background focus:shadow-[0_0_20px_rgba(251,146,60,0.15)] transition-all duration-300 placeholder:text-foreground/30"
                  placeholder={currentQuestion.type === "date" ? "" : "Type your answer here..."}
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  autoFocus
                />
                <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options?.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden",
                    answers[currentQuestion.id] === option.id
                      ? "border-accent bg-gradient-to-r from-accent/10 to-transparent shadow-[0_4px_20px_rgba(251,146,60,0.15)] scale-[1.02]"
                      : "border-border/30 hover:border-accent/40 hover:bg-background/80 hover:shadow-lg hover:scale-[1.01]"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Selection Indicator Background */}
                  <div className={cn(
                    "absolute inset-0 bg-accent/5 transition-transform duration-500 origin-left",
                    answers[currentQuestion.id] === option.id ? "scale-x-100" : "scale-x-0"
                  )}></div>

                  <div className="flex items-center space-x-4 relative z-10">
                    {/* Custom Checkbox/Radio */}
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm",
                      answers[currentQuestion.id] === option.id
                        ? "border-accent bg-gradient-to-br from-accent to-orange-600 text-white scale-110 rotate-0"
                        : "border-foreground/20 group-hover:border-accent/50 bg-background"
                    )}>
                      {answers[currentQuestion.id] === option.id && (
                        <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Option Text */}
                    <span className={cn(
                      "text-lg font-medium transition-colors duration-300",
                      answers[currentQuestion.id] === option.id ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                    )}>
                      {getText(option.text)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border/10">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="border-transparent hover:bg-foreground/5 text-foreground/60 transition-all hover:text-foreground"
          >
            <span className="mr-2">←</span> {t("assessment.previous")}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className={cn(
              "px-8 py-3 rounded-full font-bold shadow-lg shadow-accent/20 transition-all duration-300",
              !answers[currentQuestion.id]
                ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-gradient-to-r from-accent to-orange-600 hover:shadow-orange-500/30 hover:scale-105 hover:-translate-y-0.5"
            )}
          >
            {currentQuestionIndex === questions.length - 1
              ? (loading ? "Processing..." : t("assessment.complete"))
              : <span className="flex items-center">{t("assessment.next")} <span className="ml-2">→</span></span>}
          </Button>
        </div>
      </div>

      {/* Tip Section */}
      <div className="mt-8 text-center animate-in-scale delay-300">
        <div className="inline-block glass-card px-6 py-3 rounded-full bg-accent/5 border-accent/10">
          <p className="text-sm font-medium text-foreground/70">
            <span className="text-accent mr-2">💡 Tip:</span>
            {t("assessment.tipDesc") || "Answer honestly for the best results."}
          </p>
        </div>
      </div>
    </div>
  );
}
