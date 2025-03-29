"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const Page = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Profil Ayarları
        </h1>
        
        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <div className="border-b border-border pb-4 mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Görünüm Ayarları
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-muted-foreground">
                Karanlık Mod
              </div>
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <button
              onClick={handleThemeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                theme === "dark"
                  ? "bg-primary"
                  : "bg-slate-200"
              }`}
              role="switch"
              aria-checked={theme === "dark"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleThemeToggle();
                }
              }}
            >
              <span
                className={`${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-slate-50 transition-transform duration-300 ease-in-out shadow-[0_1px_4px_rgba(0,0,0,0.3)]`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;