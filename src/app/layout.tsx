import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { ShellLayout } from "@/components/ShellLayout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeScript } from "@/components/theme/theme-script";
import "@mantine/core/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gitdex Console",
  description: "Project routing, Codex sessions, and GitHub issue orchestration"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <Providers>
            <ShellLayout>{children}</ShellLayout>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
