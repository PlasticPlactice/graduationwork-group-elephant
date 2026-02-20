"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainerComponent } from "@/components/ui/ToastContainer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <ToastContainerComponent />
      </ToastProvider>
    </SessionProvider>
  );
}
