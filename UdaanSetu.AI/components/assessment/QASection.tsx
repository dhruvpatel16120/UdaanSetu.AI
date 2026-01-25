"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

import { BasicInfoForm } from "@/components/assessment/BasicInfoForm";
import { assessmentQuestions } from "@/components/assessment/NewQuestions";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/utils/cn";



interface AssessmentData {
  interests: Record<string, number>;
  personality: Record<string, number>;
  skills: Record<string, number>;
  values: Record<string, number>;
  background: Record<string, string | number>;
}

interface BasicInfo {
  name: string;
  gender: string;
  dateOfBirth: string;
  location: string;
}

const questions = assessmentQuestions;

export function QASection() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [showBasicInfoForm, setShowBasicInfoForm] = useState(true);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    interests: {},
    personality: {},
    skills: {},
    values: {},
    background: {},
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { language, t } = useI18n();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getText = (textObj: { en: string; gu: string }) => {
    return language === "gu" ? textObj.gu : textObj.en;
  };



  const handleBasicInfoSubmit = (info: BasicInfo) => {
    setShowBasicInfoForm(false);
    // Add basic info to background data
    setAssessmentData(prev => ({
      ...prev,
      background: {
        ...prev.background,
        name: info.name,
        gender: info.gender,
        dateOfBirth: info.dateOfBirth,
        location: info.location
      }
    }));
  };

  const handleAnswer = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Update assessment data based on the selected option
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    if (selectedOption) {
      const updatedData = { ...assessmentData };
      
      // Ensure the category object exists
      const category = currentQuestion.category as keyof AssessmentData;
      if (!updatedData[category]) {
        updatedData[category] = {};
      }
      
      Object.entries(selectedOption.score).forEach(([key, value]) => {
        if (typeof value === 'number') {

          const currentValue = updatedData[category][key] as number || 0;

          updatedData[category][key] = currentValue + value;
        } else {
          updatedData[category][key] = value;
        }
      });
      
      setAssessmentData(updatedData);
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
      setIsCompleted(true);
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
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAssessmentData({
      interests: {},
      personality: {},
      skills: {},
      values: {},
      background: {},
    });
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center mx-auto mb-6 glow-teal">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("assessment.completedTitle")}
          </h2>
          
          <p className="text-foreground/80 mb-8 max-w-2xl mx-auto">
            {t("assessment.completedDesc")}
          </p>

          {/* Display assessment summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-3 text-primary">{t("assessment.yourInterests")}</h3>
              <div className="space-y-2">
                {Object.entries(assessmentData.interests)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm capitalize">{key}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-semibold mb-3 text-accent">{t("assessment.yourPersonality")}</h3>
              <div className="space-y-2">
                {Object.entries(assessmentData.personality)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="glow-orange">
              {t("assessment.viewRecommendations")}
            </Button>
            <Button variant="outline" size="lg" onClick={handleRestart}>
              {t("assessment.retakeAssessment")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Show Basic Info Form first */}
      {showBasicInfoForm ? (
        <BasicInfoForm onSubmit={handleBasicInfoSubmit} />
      ) : (
        <div className="max-w-4xl mx-auto p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground/70">
                {t("assessment.questionOf", { current: currentQuestionIndex + 1, total: questions.length })}
              </span>
              <span className="text-sm font-medium text-foreground/70">
                {t("assessment.percentComplete", { percent: Math.round(progress) })}
              </span>
            </div>
            <div className="w-full bg-foreground/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-accent to-teal h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question card */}
          <div className={cn(
            "glass-card p-8 transition-all duration-300",
            isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
          )}>
            {/* Category badge */}
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
              </span>
              {currentQuestion.required && (
                <span className="text-xs text-foreground/50">{t("assessment.required")}</span>
              )}
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold mb-8 text-foreground">
              {getText(currentQuestion.question)}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                    answers[currentQuestion.id] === option.id
                      ? "border-accent bg-accent/10 glow-orange"
                      : "border-border/20 hover:border-accent/50 hover:bg-accent/5"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      answers[currentQuestion.id] === option.id
                        ? "border-accent bg-accent"
                        : "border-foreground/30"
                    )}>
                      {answers[currentQuestion.id] === option.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-foreground">{getText(option.text)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                {t("assessment.previous")}
              </Button>
              
              <div className="text-sm text-foreground/60">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
              
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                {currentQuestionIndex === questions.length - 1 ? t("assessment.complete") : t("assessment.next")}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-foreground/70 mt-6">
            <p className="font-medium mb-1">{t("assessment.tipTitle")}</p>
            <p>{t("assessment.tipDesc")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
