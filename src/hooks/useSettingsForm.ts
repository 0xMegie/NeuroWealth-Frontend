import { useEffect, useState } from "react";
import { mockAuditService } from "@/lib/mock-audit";
import { logger } from "@/lib/logger";

type SaveStatus = "idle" | "success" | "error";

interface UseSettingsFormOptions<T> {
  auditSection: string;
  loadDelayMs?: number;
  saveDelayMs?: number;
  statusResetMs?: number;
  /** Runs after the mocked save delay, before persisting. Throw to abort the save. */
  validate?: (draft: T) => void;
  onSaveSuccess?: (saved: T) => void;
  onSaveError?: (error: unknown) => void;
}

export function useSettingsForm<T>(
  storageKey: string,
  defaultValue: T,
  options: UseSettingsFormOptions<T>,
) {
  const [saved, setSaved] = useState<T>(defaultValue);
  const [draft, setDraft] = useState<T>(defaultValue);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored) as T;
          setSaved(data);
          setDraft(data);
        }
      } catch (error) {
        logger.error("Failed to load saved settings from localStorage", {
          storageKey,
          error,
        });
      }
      setPageLoading(false);
    }, options.loadDelayMs ?? 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      await new Promise((resolve) => setTimeout(resolve, options.saveDelayMs ?? 600));
      options.validate?.(draft);
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setSaved(draft);
      setStatus("success");
      setEditing(false);
      mockAuditService.logEvent("settings_change", {
        section: options.auditSection,
        changes: draft,
      });
      options.onSaveSuccess?.(draft);
      setTimeout(() => setStatus("idle"), options.statusResetMs ?? 3000);
    } catch (error) {
      setStatus("error");
      options.onSaveError?.(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(saved);
    setEditing(false);
    setStatus("idle");
  };

  return {
    saved,
    setSaved,
    draft,
    setDraft,
    editing,
    setEditing,
    saving,
    setSaving,
    status,
    setStatus,
    pageLoading,
    isDirty,
    handleSave,
    handleCancel,
  };
}
