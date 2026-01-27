"use client";


import { useState } from "react";
import { GUJARAT_DISTRICTS } from "@/constants/locations";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/utils/cn";

interface BasicInfo {
  name: string;
  gender: string;
  dateOfBirth: string;
  location: string;
}

interface BasicInfoFormProps {
  onSubmit: (info: BasicInfo) => void;
}



export function BasicInfoForm({ onSubmit }: BasicInfoFormProps) {
  const { t, language } = useI18n();
  const [formData, setFormData] = useState<BasicInfo>({
    name: "",
    gender: "",
    dateOfBirth: "",
    location: ""
  });

  const [errors, setErrors] = useState<Partial<BasicInfo>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<BasicInfo> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("assessment.errorName");
    }

    if (!formData.gender) {
      newErrors.gender = t("assessment.errorGender");
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t("assessment.errorDob");
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 10 || age > 50) {
        newErrors.dateOfBirth = t("assessment.errorAge");
      }
    }

    if (!formData.location) {
      newErrors.location = t("assessment.errorLocation");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof BasicInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-in-scale">
      <div className="glass-card p-8 sm:p-12 relative overflow-hidden shadow-2xl border-t border-white/20">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-indigo/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-indigo via-accent-cyan to-accent-teal bg-clip-text text-transparent mb-4 animate-gradient">
            {t("assessment.welcomeTitle")}
          </h2>
          <p className="text-lg text-foreground/70">
            {t("assessment.welcomeDesc")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Name Field */}
            <div className="space-y-2 group">
              <label className="block text-sm font-semibold text-foreground/80 ml-1 transition-colors group-hover:text-accent">
                {t("assessment.nameLabel")} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField(null)}
                  placeholder={t("assessment.namePlaceholder")}
                  className={cn(
                    "w-full px-5 py-4 rounded-xl border-2 bg-background/50 outline-none transition-all duration-300",
                    errors.name 
                      ? "border-destructive/50 focus:border-destructive shadow-destructive/10" 
                      : "border-border/30 hover:border-accent/30 focus:border-accent focus:shadow-[0_0_15px_rgba(251,146,60,0.15)]"
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive font-medium ml-1 animate-slide-up">{errors.name}</p>
              )}
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-2 group">
              <label className="block text-sm font-semibold text-foreground/80 ml-1 transition-colors group-hover:text-accent">
                {t("assessment.dobLabel")} <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                onFocus={() => setActiveField('dob')}
                onBlur={() => setActiveField(null)}
                max={new Date().toISOString().split('T')[0]}
                className={cn(
                  "w-full px-5 py-4 rounded-xl border-2 bg-background/50 outline-none transition-all duration-300",
                  errors.dateOfBirth 
                    ? "border-destructive/50 focus:border-destructive" 
                    : "border-border/30 hover:border-accent/30 focus:border-accent focus:shadow-[0_0_15px_rgba(251,146,60,0.15)]"
                )}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive font-medium ml-1 animate-slide-up">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>

          {/* Gender Field */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">
              {t("assessment.genderLabel")} <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["Male", "Female", "Other"].map((gender) => {
                 let label = t("assessment.other");
                 if(gender === "Male") label = t("assessment.male");
                 if(gender === "Female") label = t("assessment.female");

                 const isSelected = formData.gender === gender;
                 
                 return (
                  <label
                    key={gender}
                    className={cn(
                      "relative flex items-center justify-center px-4 py-4 border-2 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden group",
                      isSelected
                        ? "border-accent bg-accent/5 shadow-[0_4px_15px_rgba(251,146,60,0.15)]"
                        : "border-border/30 hover:border-accent/30 hover:bg-background/80"
                    )}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={isSelected}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="sr-only"
                    />
                    
                    {/* Animated Background on Selection */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent transition-opacity duration-300",
                        isSelected ? "opacity-100" : "opacity-0"
                    )}></div>

                    <span className={cn(
                        "relative z-10 font-medium transition-colors",
                         isSelected ? "text-accent" : "text-foreground/70 group-hover:text-foreground"
                    )}>{label}</span>
                  </label>
                );
              })}
            </div>
            {errors.gender && (
              <p className="text-sm text-destructive font-medium ml-1 animate-slide-up">{errors.gender}</p>
            )}
          </div>

          {/* Location Field */}
          <div className="space-y-2 group">
            <label className="block text-sm font-semibold text-foreground/80 ml-1 transition-colors group-hover:text-accent">
              {t("assessment.locationLabel")} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                onFocus={() => setActiveField('location')}
                onBlur={() => setActiveField(null)}
                className={cn(
                  "w-full px-5 py-4 rounded-xl border-2 bg-background/50 outline-none appearance-none transition-all duration-300 cursor-pointer",
                  errors.location 
                    ? "border-destructive/50 focus:border-destructive" 
                    : "border-border/30 hover:border-accent/30 focus:border-accent focus:shadow-[0_0_15px_rgba(251,146,60,0.15)]"
                )}
              >
                <option value="">{t("assessment.selectLocation")}</option>
                {GUJARAT_DISTRICTS.map((district) => (
                  <option key={district.en} value={district.en}>
                    {language === "gu" ? district.gu : district.en}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-foreground/50 group-hover:text-accent transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.location && (
              <p className="text-sm text-destructive font-medium ml-1 animate-slide-up">{errors.location}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
             <Button
                type="submit"
                size="lg"
                className="w-full py-6 text-lg font-bold shadow-lg shadow-accent/20 bg-gradient-to-r from-accent to-orange-600 hover:shadow-orange-500/30 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 rounded-full"
            >
                {t("assessment.startBtn")}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-accent/5 border border-accent/10">
                <p className="text-xs text-foreground/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    AI Assessment Engine Ready
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
