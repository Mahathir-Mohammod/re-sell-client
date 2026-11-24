"use client";

import { ThemeProvider as NextThemes } from "next-themes";

// class-based so the `.dark` variables in globals.css drive the whole palette
export function ThemeProvider({ children }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}
