import { I18nManager, useColorScheme } from 'react-native';

export interface Theme {
  isDark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  gold: string;
  goldSoft: string;
  navy: string;
  headerBg: string;
  headerText: string;
  danger: string;
  placeholder: string;
  overlay: string;
}

export const lightTheme: Theme = {
  isDark: false,
  bg: '#FBF6E9',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EBD6',
  text: '#0E1F3B',
  textMuted: '#5B6679',
  border: '#E6DCC3',
  gold: '#B8903A',
  goldSoft: '#F0E2BC',
  navy: '#0B1F3A',
  headerBg: '#0B1F3A',
  headerText: '#F7EFD8',
  danger: '#B3261E',
  placeholder: '#98A0AE',
  overlay: 'rgba(8, 17, 31, 0.55)',
};

export const darkTheme: Theme = {
  isDark: true,
  bg: '#08111F',
  surface: '#102339',
  surfaceAlt: '#16304D',
  text: '#F3ECD9',
  textMuted: '#A5B1C4',
  border: '#1F3A5A',
  gold: '#D6B15C',
  goldSoft: '#2B3A52',
  navy: '#0B1F3A',
  headerBg: '#0B1F3A',
  headerText: '#F7EFD8',
  danger: '#F2766F',
  placeholder: '#6F7F96',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const radius = {
  card: 20,
  button: 16,
  input: 14,
  pill: 999,
};

/**
 * Row direction that always lays children out right-to-left, whether or not
 * the OS has already switched the layout direction to RTL.
 */
export const rowDir: 'row' | 'row-reverse' = I18nManager.isRTL ? 'row' : 'row-reverse';

/** Text style for Arabic content. */
export const rtlText = {
  textAlign: 'right' as const,
  writingDirection: 'rtl' as const,
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
