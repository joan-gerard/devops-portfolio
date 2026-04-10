"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Client-only wrapper for next-themes ThemeProvider.
 * Sets `data-theme` attribute on `<html>`, persists choice to localStorage,
 * and respects the OS `prefers-color-scheme` when theme is "system".
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
