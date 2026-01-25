"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useI18n } from "@/hooks/useI18n";
import { TranslationKey } from "@/types/i18n";
import { resources, categoryInfo, type Resource } from "@/constants/resources";
import { cn } from "@/utils/cn";

export default function ResourcesPage() {
  const { t, language } = useI18n();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setIsSearching(false);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Advanced search function with fuzzy matching
  const searchScore = useCallback((resource: Resource, query: string): number => {
    if (!query) return 1; // No query = all results match equally

    const lowerQuery = query.toLowerCase();
    const title = resource.title[language].toLowerCase();
    const description = resource.description[language].toLowerCase();
    const tags = resource.tags.join(" ").toLowerCase();
    
    let score = 0;

    // Exact title match (highest priority)
    if (title === lowerQuery) score += 100;
    
    // Title starts with query
    if (title.startsWith(lowerQuery)) score += 50;
    
    // Title contains query
    if (title.includes(lowerQuery)) score += 30;
    
    // Description contains query
    if (description.includes(lowerQuery)) score += 20;
    
    // Tags contain query
    if (tags.includes(lowerQuery)) score += 15;
    
    // Word-by-word matching (for multi-word queries)
    const queryWords = lowerQuery.split(" ").filter(w => w.length > 2);
    queryWords.forEach(word => {
      if (title.includes(word)) score += 10;
      if (description.includes(word)) score += 5;
      if (tags.includes(word)) score += 3;
    });

    // Fuzzy matching - check if query letters appear in order
    let queryIndex = 0;
    for (let i = 0; i < title.length && queryIndex < lowerQuery.length; i++) {
      if (title[i] === lowerQuery[queryIndex]) {
        queryIndex++;
        score += 1;
      }
    }

    return score;
  }, [language]);

  // Filter and sort resources based on search and category
  const filteredResources = useMemo(() => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter and score by search query
    if (debouncedSearch) {
      const scoredResources = filtered
        .map(resource => ({
          resource,
          score: searchScore(resource, debouncedSearch)
        }))
        .filter(item => item.score > 0) // Only include results with some match
        .sort((a, b) => b.score - a.score); // Sort by relevance

      return scoredResources.map(item => item.resource);
    }

    return filtered;
  }, [debouncedSearch, selectedCategory, searchScore]);

  const categories = [
    { id: "all", label: t("resources.allCategories") },
    { id: "government", label: t("resources.government") },
    { id: "online", label: t("resources.online") },
    { id: "scholarships", label: t("resources.scholarships") },
    { id: "jobs", label: t("resources.jobs") },
    { id: "youtube", label: t("resources.youtube") },
    { id: "counseling", label: t("resources.counseling") },
    { id: "skills", label: t("resources.skills") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {t("resources.heroTitle")}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
            {t("resources.heroDesc")}
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 bg-background/95 backdrop-blur-sm border-b border-border/20 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          
          {/* Search Bar - Centered & Prominent */}
          <div className="w-full max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-foreground/40 group-focus-within:text-accent transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t("resources.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsSearching(true);
              }}
              className="w-full pl-12 pr-12 py-4 bg-background border-2 border-border/20 rounded-2xl focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none text-foreground text-lg shadow-sm hover:border-accent/50 transition-all duration-300"
            />
            
            {/* Loading indicator */}
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Clear button */}
            {searchInput && !isSearching && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 p-1 rounded-full transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter - Scrollable on mobile, Wrapped on desktop */}
          <div className={cn(
            "flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth", // Mobile styles
            "md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:flex-wrap md:justify-center dark:scrollbar-hide", // Desktop styles
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" // Hide scrollbar
          )}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 border",
                  selectedCategory === category.id
                    ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] scale-105"
                    : "bg-background border-border/40 text-foreground/70 hover:border-accent/50 hover:text-foreground hover:bg-accent/5"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/60 animate-fadeIn">
            <div className="bg-accent/10 p-1 rounded-full text-accent">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p>
              <span className="font-bold text-foreground">{filteredResources.length}</span> {language === "gu" ? "સંસાધનો મળ્યા" : "resources found"}
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 px-4 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {filteredResources.map((resource, index) => (
                <div
                  key={resource.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-slideUp"
                >
                  <ResourceCard resource={resource} language={language} t={t} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fadeIn">
              <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{t("resources.noResults")}</h3>
              <p className="text-foreground/60 mb-6">{t("resources.noResultsDesc")}</p>
              {(searchInput || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSelectedCategory("all");
                  }}
                  className="px-6 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  {language === "gu" ? "બધા સંસાધનો જુઓ" : "Show All Resources"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Resource Card Component
function ResourceCard({ resource, language, t }: { resource: Resource; language: "en" | "gu"; t: (key: TranslationKey) => string }) {
  const categoryMeta = categoryInfo[resource.category];

  return (
    <div className="glass-card p-6 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110",
          `bg-gradient-to-br ${categoryMeta.color}`
        )}>
          {categoryMeta.icon}
        </div>
        <div className="flex flex-col gap-1 items-end">
          {resource.isFree && (
            <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
              {t("resources.free")}
            </span>
          )}
          {resource.languages.includes("both") ? (
            <span className="px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full">
              {t("resources.both")}
            </span>
          ) : resource.languages.includes("gu") ? (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
              {t("resources.gujarati")}
            </span>
          ) : (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
              {t("resources.english")}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 min-h-[3.5rem]">
        {resource.title[language]}
      </h3>
      <p className="text-foreground/70 mb-4 line-clamp-3 flex-grow text-sm leading-relaxed">
        {resource.description[language]}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {resource.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-foreground/5 text-foreground/60 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "w-full py-3 rounded-xl font-medium text-center transition-all duration-200 flex items-center justify-center gap-2 group/btn",
          `bg-gradient-to-r ${categoryMeta.color} text-white hover:shadow-lg hover:scale-105`
        )}
      >
        <span>{resource.category === "youtube" ? t("resources.watchChannel") : t("resources.visitWebsite")}</span>
        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
