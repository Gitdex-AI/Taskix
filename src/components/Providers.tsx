"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: '"SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif',
    fontWeight: "760"
  },
  components: {
    Button: {
      defaultProps: {
        fw: 700
      }
    },
    Paper: {
      defaultProps: {
        withBorder: true,
        shadow: "xs"
      }
    }
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
