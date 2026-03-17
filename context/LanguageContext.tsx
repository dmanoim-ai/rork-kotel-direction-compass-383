import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, NativeModules, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import translations, { Language } from '@/constants/translations';

export type DistanceUnit = 'km' | 'mi';
const UNIT_KEY = '@app_distance_unit';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'es', 'de', 'ru', 'he'];

function getDeviceLanguage(): Language {
  try {
    let locale = 'en';
    if (Platform.OS === 'web') {
      locale = navigator?.language ?? 'en';
    } else if (Platform.OS === 'ios') {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ??
        'en';
    } else {
      locale = NativeModules.I18nManager?.localeIdentifier ?? 'en';
    }
    const langCode = locale.split(/[-_]/)[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(langCode as Language)) {
      return langCode as Language;
    }
  } catch (e) {
    console.log('Error detecting device language:', e);
  }
  return 'en';
}

const LANGUAGE_KEY = '@app_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>('en');
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>('km');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
          setLanguageState(stored as Language);
        } else {
          const detected = getDeviceLanguage();
          setLanguageState(detected);
          await AsyncStorage.setItem(LANGUAGE_KEY, detected);
        }
        const storedUnit = await AsyncStorage.getItem(UNIT_KEY);
        if (storedUnit === 'km' || storedUnit === 'mi') {
          setDistanceUnitState(storedUnit);
        }
      } catch (e) {
        console.log('Error loading language:', e);
      }
      setIsLoaded(true);
    };
    void load();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
      console.log('Error saving language:', e);
    }
  }, []);

  const setDistanceUnit = useCallback(async (unit: DistanceUnit) => {
    setDistanceUnitState(unit);
    try {
      await AsyncStorage.setItem(UNIT_KEY, unit);
    } catch (e) {
      console.log('Error saving distance unit:', e);
    }
  }, []);

  const isRTL = language === 'he';

  useEffect(() => {
    if (Platform.OS !== 'web') {
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
    }
  }, [isRTL]);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] ?? translations.en[key] ?? key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    distanceUnit,
    setDistanceUnit,
    t,
    isLoaded,
    isRTL,
  }), [language, setLanguage, distanceUnit, setDistanceUnit, t, isLoaded, isRTL]);

  return value;
});
