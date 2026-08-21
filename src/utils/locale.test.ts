import { describe, expect, it } from 'vitest';
import { resolveLocale } from './locale';

const supportedLocales = ['de', 'en', 'es', 'fr', 'no', 'pt', 'uk', 'vi', 'zh'];

describe('resolveLocale', () => {
  it('uses a saved supported locale before the browser locale', () => {
    expect(resolveLocale({ browserLocales: ['zh-CN'], supportedLocales, savedLocale: 'fr' })).toBe('fr');
  });

  it('matches a regional browser locale by its language code', () => {
    expect(resolveLocale({ browserLocales: ['zh-CN'], supportedLocales })).toBe('zh');
  });

  it('uses the first supported locale from the browser preference list', () => {
    expect(resolveLocale({ browserLocales: ['ja-JP', 'de-DE', 'en-US'], supportedLocales })).toBe('de');
  });

  it('maps Norwegian browser locale codes to the supported locale', () => {
    expect(resolveLocale({ browserLocales: ['nb-NO'], supportedLocales })).toBe('no');
  });

  it('falls back to English when no browser locale is supported', () => {
    expect(resolveLocale({ browserLocales: ['ja-JP'], supportedLocales })).toBe('en');
  });
});
