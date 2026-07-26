"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DiagnosticsPanelContent = dynamic(
  () => import("./DiagnosticsPanelContent").then((mod) => mod.DiagnosticsPanelContent),
  { ssr: false }
);

export function DiagnosticsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(
      process.env.NODE_ENV !== "production" ||
      window.location.search.includes("debug=true")
    );
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-dev-tool">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-2 rounded-full border border-slate-600 shadow-2xl transition-all"
          title="Open Diagnostics"
          aria-expanded={false}
          aria-haspopup="dialog"
        >
          <span className="text-lg">🛠️</span>
        </button>
      ) : (
        <DiagnosticsPanelContent onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
