import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEFAULT_LOCALE as ENV_DEFAULT_LOCALE} from '@env';

import {FluentBundle, FluentResource} from '@fluent/bundle';
import {negotiateLanguages} from '@fluent/langneg';
import {LocalizationProvider, ReactLocalization} from '@fluent/react';

import dayjs from 'dayjs';

import {en_US, id_ID} from '@constants/fluent-templates';

export type Locale = 'en-US' | 'id-ID';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

type LocaleProviderProps = {
  children: React.ReactNode;
};

export const DEFAULT_LOCALE: Locale = ENV_DEFAULT_LOCALE || 'en-US';
const LOCALE_STORAGE_KEY = 'locale';

function* lazilyParsedBundles(fetchedMessages: Array<[Locale, string]>) {
  for (const [locale, messages] of fetchedMessages) {
    const resource = new FluentResource(messages);
    const bundle = new FluentBundle(locale);
    bundle.addResource(resource);
    yield bundle;
  }
}

const LocaleContext = React.createContext<LocaleContextType | null>(null);

export const LocaleProvider = ({children}: LocaleProviderProps) => {
  const [locale, setLocale] = React.useState<Locale | undefined>();
  const [l10n, setL10n] = React.useState<ReactLocalization | null>(null);

  const changeLocales = React.useCallback(
    async (locales: Array<Locale>) => {
      const currentLocales = negotiateLanguages(locales, ['en-US', 'id-ID'], {
        defaultLocale: DEFAULT_LOCALE,
      }) as Locale[];

      const localeAssets = currentLocales.map<[Locale, string]>(_locale => {
        if (_locale === 'en-US') {
          return [_locale, en_US];
        } else {
          return [_locale, id_ID];
        }
      });

      const bundles = lazilyParsedBundles(localeAssets);
      setL10n(new ReactLocalization(bundles, null));
    },
    [setL10n],
  );

  React.useEffect(() => {
    if (locale) {
      AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
      changeLocales([locale]);

      if (locale === 'en-US') {
        dayjs.locale('en');
      } else if (locale === 'id-ID') {
        dayjs.locale('id');
      }

      return;
    }

    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then(l => {
      const _locale = l as Locale | null;
      setLocale(_locale ?? DEFAULT_LOCALE);
    });
  }, [changeLocales, locale, setLocale]);

  if (!l10n) {
    return <React.Fragment />;
  }

  return (
    <LocaleContext.Provider
      value={{
        locale: locale ?? DEFAULT_LOCALE,
        setLocale,
      }}>
      <LocalizationProvider l10n={l10n}>{children}</LocalizationProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = React.useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
};
