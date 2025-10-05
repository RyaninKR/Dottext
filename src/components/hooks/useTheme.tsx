import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'sepia';
export type FontFamily = 'serif' | 'sans' | 'mono';
export type ColorTheme = 'amber' | 'blue' | 'green' | 'purple' | 'rose';
export type EditorLayout = 'normal' | 'zen' | 'typewriter';

interface ThemeSettings {
  mode: ThemeMode;
  fontFamily: FontFamily;
  colorTheme: ColorTheme;
  fontSize: number;
  lineHeight: number;
  editorLayout: EditorLayout;
  showLineNumbers: boolean;
  focusMode: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (updates: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: ThemeSettings = {
  mode: 'light',
  fontFamily: 'serif',
  colorTheme: 'amber',
  fontSize: 16,
  lineHeight: 1.8,
  editorLayout: 'normal',
  showLineNumbers: false,
  focusMode: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editor-theme-settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('editor-theme-settings', JSON.stringify(settings));
    
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.mode);
    root.setAttribute('data-color-theme', settings.colorTheme);
    root.setAttribute('data-font-family', settings.fontFamily);
    root.setAttribute('data-editor-layout', settings.editorLayout);
    
    // Apply CSS custom properties
    root.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--editor-line-height', settings.lineHeight.toString());
  }, [settings]);

  const updateSettings = (updates: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}