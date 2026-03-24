"use client";

import { useState, useEffect, useCallback } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss?: () => void;
}

/**
 * Lightweight toast notification — fixed bottom-center.
 * Auto-dismisses after 3 seconds with slide-in / slide-out animation.
 */
export default function Toast({ message, type, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    // Wait for the exit animation to finish before calling onDismiss
    setTimeout(() => onDismiss?.(), 200);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(), 3000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  const borderAccent =
    type === "success" ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-red-500";

  const accent =
    type === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : "border-red-500/30 bg-red-500/10 text-red-400";

  const icon =
    type === "success" ? (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    ) : (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    );

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 ${exiting ? "toast-exit" : "toast-enter"}`}
    >
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${borderAccent} ${accent}`}
      >
        {icon}
        {message}
      </div>
    </div>
  );
}

/**
 * Hook for managing toast state in a page.
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   showToast("Saved!", "success");
 *   {toast}  // render in JSX
 */
export function useToast() {
  const [toastData, setToastData] = useState<{
    message: string;
    type: "success" | "error";
    key: number;
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToastData({ message, type, key: Date.now() });
  }, []);

  const toast = toastData ? (
    <Toast
      key={toastData.key}
      message={toastData.message}
      type={toastData.type}
      onDismiss={() => setToastData(null)}
    />
  ) : null;

  return { toast, showToast };
}
