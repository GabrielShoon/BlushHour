"use client";

import Link from "next/link";
import { useApp } from "./app-state";

export function Toaster() {
  const { toast, dismissToast } = useApp();
  const action = toast?.action;
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6"
    >
      {toast && (
        <div
          key={toast.id}
          className="rise pointer-events-auto flex items-center gap-4 rounded-full bg-ink py-2 pl-5 pr-2 text-sm font-medium text-bg shadow-lift"
        >
          <span>{toast.message}</span>
          {action?.href && (
            <Link
              href={action.href}
              onClick={dismissToast}
              className="rounded-full bg-rose px-4 py-2 font-semibold text-rose-ink hover:brightness-110"
            >
              {action.label}
            </Link>
          )}
          {action?.onClick && (
            <button
              type="button"
              onClick={() => {
                action.onClick?.();
                dismissToast();
              }}
              className="rounded-full bg-rose px-4 py-2 font-semibold text-rose-ink hover:brightness-110"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
