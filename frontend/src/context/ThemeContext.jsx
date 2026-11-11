import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// New key so earlier saved "night" choices do not hide the Day redesign.
const STORAGE_KEY = 'ppp-theme-v2';
const ThemeContext = createContext({ theme: 'day', toggleTheme: () => {} });

const readTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'night' ? 'night' : 'day';
  } catch {
    return 'day';
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'day' ? 'night' : 'day')), []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

// Chart colours per theme. Day uses muted green / slate / amber.
// eslint-disable-next-line react-refresh/only-export-components
export const getChartColors = (theme) =>
  theme === 'day'
    ? {
        grid: '#E1E5E0',
        axis: '#667580',
        radiusAxis: '#99A4AB',
        polar: '#D3D9D4',
        tooltipBg: '#FFFFFF',
        tooltipBorder: '#D3D9D4',
        tooltipText: '#25313A',
        track: '#E6E9E5',
        primary: '#267A67',
        secondary: '#667580',
        tertiary: '#D5A45B',
        tiers: ['#B4584A', '#D5A45B', '#667580', '#267A67', '#172B36'],
        gauge: ['#267A67', '#4C9A87', '#667580', '#D5A45B', '#B4584A'],
      }
    : {
        grid: '#1e293b',
        axis: '#64748b',
        radiusAxis: '#475569',
        polar: '#334155',
        tooltipBg: '#0f172a',
        tooltipBorder: '#334155',
        tooltipText: '#f8fafc',
        track: '#1e293b',
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        tertiary: '#10b981',
        tiers: ['#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'],
        gauge: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e'],
      };
