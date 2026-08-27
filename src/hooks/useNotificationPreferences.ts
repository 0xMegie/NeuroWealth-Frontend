import { useState } from "react";
import { NotificationPreferences, DEFAULT_PREFERENCES } from "@/lib/mock-preferences";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const NOTIFICATION_PREFERENCES_STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS;

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    const stored = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    try {
      return JSON.parse(stored);
    } catch {
      // Malformed JSON - fallback to defaults and repair corrupted storage
      localStorage.setItem(
        NOTIFICATION_PREFERENCES_STORAGE_KEY,
        JSON.stringify(DEFAULT_PREFERENCES),
      );
      return DEFAULT_PREFERENCES;
    }
  });
  const [loading] = useState(false);

  const updatePreference = (
    section: "categories" | "channels" | "emailDigest",
    key: string,
    value: boolean
  ) => {
    const updated = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value,
      },
    };
    setPreferences(updated);
    localStorage.setItem(
      NOTIFICATION_PREFERENCES_STORAGE_KEY,
      JSON.stringify(updated),
    );
  };

  return {
    preferences,
    loading,
    updatePreference,
  };
}
