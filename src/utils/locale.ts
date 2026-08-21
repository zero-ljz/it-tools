const localeAliases: Record<string, string> = {
  nb: 'no',
  nn: 'no',
};

export function resolveLocale({
  browserLocales,
  supportedLocales,
  savedLocale,
  fallbackLocale = 'en',
}: {
  browserLocales: readonly string[]
  supportedLocales: readonly string[]
  savedLocale?: string
  fallbackLocale?: string
}) {
  const supportedLocalesByCode = new Map(supportedLocales.map(locale => [locale.toLowerCase(), locale]));

  const matchLocale = (locale: string) => {
    const normalizedLocale = locale.toLowerCase();
    const languageCode = normalizedLocale.split('-')[0];

    return (
      supportedLocalesByCode.get(normalizedLocale)
      ?? supportedLocalesByCode.get(localeAliases[normalizedLocale])
      ?? supportedLocalesByCode.get(languageCode)
      ?? supportedLocalesByCode.get(localeAliases[languageCode])
    );
  };

  if (savedLocale) {
    const matchedSavedLocale = supportedLocalesByCode.get(savedLocale.toLowerCase());
    if (matchedSavedLocale) {
      return matchedSavedLocale;
    }
  }

  for (const browserLocale of browserLocales) {
    const matchedLocale = matchLocale(browserLocale);
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  return supportedLocalesByCode.get(fallbackLocale.toLowerCase()) ?? supportedLocales[0] ?? fallbackLocale;
}
