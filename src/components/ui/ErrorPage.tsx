"use client";

import { ReactNode, useEffect, useRef } from "react";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";
import { Button } from "./Button";

interface ErrorPageProps {
  statusCode: string | number;
  title: string;
  description: string;
  icon?: ReactNode;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href?: string; onClick?: () => void };
}

/**
 * Reusable branded error page with recovery actions.
 *
 * Spec: distinct title + recovery per status, primary above secondary on mobile.
 */
export function ErrorPage({
  statusCode,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
}: ErrorPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div 
      ref={containerRef}
      id={MAIN_CONTENT_LANDMARK_ID}
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center bg-dark-900 px-4"
    >
      <div className="text-center max-w-md">
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 mx-auto mb-6">
            {icon}
          </div>
        )}

        <p className="text-6xl font-bold text-sky-500/30 mb-4">{statusCode}</p>

        <h1 className="text-2xl font-bold text-slate-100 mb-3">{title}</h1>

        <p className="text-sm text-slate-400 max-w-[420px] leading-relaxed mb-8 mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={primaryAction.href}>
            <Button variant="primary" size="md">
              {primaryAction.label}
            </Button>
          </a>

          {secondaryAction && (
            secondaryAction.href ? (
              <a href={secondaryAction.href}>
                <Button variant="secondary" size="md">
                  {secondaryAction.label}
                </Button>
              </a>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
