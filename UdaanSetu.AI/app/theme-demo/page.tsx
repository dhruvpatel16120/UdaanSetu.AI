"use client";

import { useTheme } from "@/store/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function ThemeDemo() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="relative inline-block brand-name cursor-pointer">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-500 bg-clip-text text-transparent animate-gradient bg-300">
              udaan
            </span>
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-gradient bg-300 animation-delay-200">
              setu
            </span>
            <span className="text-foreground/80">.ai</span>
          </span>
          <br />
          <span className="text-2xl text-muted-foreground font-normal">Theme Demo</span>
        </h1>
        
        <div className="glass-card rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Current Theme: {theme}</h2>
            <ThemeToggle />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Text Colors</h3>
              <p className="text-foreground">Foreground text</p>
              <p className="text-muted-foreground">Muted foreground text</p>
              <p className="text-accent">Accent text</p>
              <p className="text-primary">Primary text</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Button Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Card Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-lg p-4">
                <h4 className="font-medium mb-2">Glass Card</h4>
                <p className="text-sm text-muted-foreground">
                  This uses the glass-card class with backdrop blur
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Muted Background</h4>
                <p className="text-sm text-muted-foreground">
                  This uses the muted background color
                </p>
              </div>
              <div className="bg-linear-to-br from-accent to-teal rounded-lg p-4 text-white">
                <h4 className="font-medium mb-2">Gradient Card</h4>
                <p className="text-sm">
                  This uses the brand gradient colors
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Click the theme toggle button in the navbar or here to switch between light and dark themes.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Your theme preference is automatically saved and will persist across page reloads.
          </p>
        </div>
      </div>
    </div>
  );
}
