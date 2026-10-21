"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--surface-4)",
          color: "var(--ink-900)",
          border: "1px solid var(--line)",
          boxShadow: "var(--elev-3)",
          borderRadius: "0.75rem",
        },
      }}
    />
  );
}
