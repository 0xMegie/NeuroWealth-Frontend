/**
 * Centralized locale option list.
 *
 * Two distinct locale concepts exist in this app — keeping them straight matters:
 *
 *   1. AppLocale (`"en" | "fr"`, see `src/lib/i18n/messages.ts`)
 *      The UI translation locale, controlled by `LocaleSwitcher` + `I18nContext`.
 *      Determines which dictionary renders the app's strings. Persisted under
 *      `STORAGE_KEYS.LOCALE`.
 *
 *   2. BCP47 display locale (`"en-US"`, `"fr-FR"`, etc.)
 *      Stored inside the profile / preferences blobs (`STORAGE_KEYS.PROFILE`,
 *      `STORAGE_KEYS.PREFERENCES`). Used for number, date, and currency formatting
 *      via `Intl.*`. It encodes both language AND region — `en-US` vs `en-GB` vs
 *      `en-NG` all render dates and currency differently even though the app
 *      copy stays in English.
 *
 * They are intentionally separate: a user can read the app in English but format
 * money as Naira, or switch the UI to French while keeping `pt-BR` formatting.
 * Sync is only needed at the language-base level — see `bcp47ToAppLocale` /
 * `appLocaleToBcp47Default` below.
 */
import type { AppLocale } from "@/lib/i18n/messages";

export interface LocaleOption {
  /** BCP47 tag, e.g. "en-US". */
  value: string;
  /** Human-readable label rendered in dropdowns. */
  label: string;
}

export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-NG", label: "English (Nigeria)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
] as const;

/** Default BCP47 tag for each supported UI translation locale. */
const APP_LOCALE_TO_BCP47_DEFAULT: Record<AppLocale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

/**
 * Given a BCP47 display locale, return the matching UI translation locale
 * (or `null` if the language base is not one we ship translations for).
 *
 * Use this when the user changes their profile/preferences locale and you
 * want to *optionally* nudge the UI translation in the same direction.
 */
export function bcp47ToAppLocale(bcp47: string): AppLocale | null {
  const base = bcp47.toLowerCase().split("-")[0];
  if (base === "en") return "en";
  if (base === "fr") return "fr";
  return null;
}

/**
 * Inverse of `bcp47ToAppLocale`: pick a reasonable default BCP47 tag for
 * the current UI translation locale. Used when seeding profile/preferences
 * before the user has chosen explicitly.
 */
export function appLocaleToBcp47Default(appLocale: AppLocale): string {
  return APP_LOCALE_TO_BCP47_DEFAULT[appLocale];
}
