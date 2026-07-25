"use client";

import { useTheme } from "@/contexts/ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import type { ThemeMode } from "@/contexts/ThemeProvider";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeSettings() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 rounded-xl bg-surface-elevated p-1" role="radiogroup" aria-label="Theme selection">
        <div className="min-h-[44px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-surface-elevated p-1" role="radiogroup" aria-label="Theme selection">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 min-h-[44px] ${
            theme === value
              ? "bg-sky-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-white/5"
          }`}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
