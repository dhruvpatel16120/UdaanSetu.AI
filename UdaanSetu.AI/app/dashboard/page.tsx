"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { ROUTES } from "@/constants/routes";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickAction {
  id: string;
  text: string;
  response: string;
}

export default function DashboardPage() {
  const { user, status, signOut } = useAuth();
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      text: t("chatbot.careerAssessment") || "Start Career Assessment",
      response: t("chatbot.assessmentResponse") || "I'd be happy to help you with a career assessment! Let me ask you some questions about your interests, skills, and goals. What subjects do you enjoy most?"
    },
    {
      id: '2', 
      text: t("chatbot.skillDevelopment") || "Skill Development",
      response: t("chatbot.skillResponse") || "Great choice! Based on your profile, I recommend focusing on digital skills that are in high demand. Would you like to learn about programming, digital marketing, or data analysis?"
    },
    {
      id: '3',
      text: t("chatbot.jobOpportunities") || "Job Opportunities",
      response: t("chatbot.jobResponse") || "There are many exciting opportunities in the tech sector! Let me help you explore different career paths. What type of work interests you - working with people, data, or creative projects?"
    },
    {
      id: '4',
      text: t("chatbot.learningResources") || "Learning Resources",
      response: t("chatbot.learningResponse") || "I have access to many free and paid learning resources! Are you looking for online courses, workshops, or self-study materials? Also, do you prefer learning in English or Gujarati?"
    }
  ];

  useEffect(() => {
    // Welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: t("chatbot.welcome") || `Hello ${user?.displayName || user?.email?.split('@')[0] || 'there'}! 👋 I'm your AI career mentor. I'm here to help you discover your skills, build your future, and guide you from rural dreams to digital careers. How can I assist you today?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [user, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      // eslint-disable-next-line
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('career') || input.includes('કારકિર્દી')) {
      return t("chatbot.careerAdvice") || "Career planning is exciting! Let me help you explore different options. What are your favorite subjects in school? Are you more interested in technology, business, or creative fields?";
    }
    
    if (input.includes('skill') || input.includes('કૌશલ્ય')) {
      return t("chatbot.skillAdvice") || "Developing skills is crucial for career success! I recommend starting with digital literacy, then moving to specific technical skills. What's your current skill level?";
    }
    
    if (input.includes('job') || input.includes('નોકરી')) {
      return t("chatbot.jobAdvice") || "The job market is evolving rapidly! Remote work and digital skills are in high demand. What type of work environment interests you?";
    }
    
    if (input.includes('learn') || input.includes('શીખવવું')) {
      return t("chatbot.learningAdvice") || "Learning is a lifelong journey! I can suggest both free and paid resources. What's your preferred learning style - videos, reading, or hands-on practice?";
    }
    
    return t("chatbot.defaultResponse") || "That's interesting! I'm here to help with career guidance, skill development, and finding opportunities. Could you tell me more about what you'd like to achieve?";
  };

  const handleQuickAction = (action: QuickAction) => {
    const userMessage: Message = {
      // eslint-disable-next-line
      id: Date.now().toString(),
      text: action.text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: action.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-foreground/70 mb-6">Please sign in to access your AI career mentor.</p>
          <Link href={ROUTES.auth.signIn}>
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-card border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={ROUTES.home} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  udaansetu.ai
                </span>
              </Link>
              <h1 className="text-xl font-semibold text-foreground">
                {t("nav.dashboard") || "AI Career Mentor"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-foreground/70">
                {user.displayName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                {t("nav.signOut")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-accent text-white'
                    : 'glass-card text-foreground'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-foreground/50'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="glass-card px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs h-auto py-2 px-3"
                >
                  {action.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border/20 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t("chatbot.inputPlaceholder") || "Ask me about careers, skills, or opportunities..."}
              className="flex-1 px-4 py-3 glass-card border-0 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-full"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="px-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
