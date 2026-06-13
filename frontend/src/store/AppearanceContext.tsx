import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsApi } from '../services/settings.api';

interface AppearanceSettings {
  brandName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  accentColor: string;
  theme: string;
  sidebarStyle: string;
  cardStyle: string;
}

interface AppearanceContextType extends AppearanceSettings {
  isLoading: boolean;
  refreshAppearance: () => Promise<void>;
  updateLocalSettings: (settings: Partial<AppearanceSettings>) => void;
}

const defaultSettings: AppearanceSettings = {
  brandName: 'HomelabOS',
  logo: '',
  favicon: '/favicon.ico',
  primaryColor: '#4F8CFF',
  accentColor: '#7A5CFF',
  theme: 'dark',
  sidebarStyle: 'glass',
  cardStyle: 'glass',
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const applyStyles = (s: AppearanceSettings) => {
    const root = document.documentElement;

    // Apply primary & accent colors directly
    root.style.setProperty('--primary-color', s.primaryColor);
    root.style.setProperty('--accent-color', s.accentColor);

    // Apply Tailwind CSS variables if applicable
    // Convert hex to HSL for v4 variable compatibility or use directly
    // v4 index.css uses: --primary: 219 100% 66% (HSL components)
    // To support arbitrary hex seamlessly we can inject them as direct color properties or helper classes
    // We can also override inline variables or use inline styling values in components.
    
    // Update Document Title
    if (s.brandName) {
      document.title = `${s.brandName} - Central Infrastructure Management`;
    }

    // Update Favicon link
    if (s.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = s.favicon;
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getAppearance();
      if (data) {
        const merged = { ...defaultSettings, ...data };
        setSettings(merged);
        applyStyles(merged);
      }
    } catch (error) {
      console.error('Failed to load appearance settings:', error);
      applyStyles(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshAppearance = async () => {
    await fetchSettings();
  };

  const updateLocalSettings = (newSettings: Partial<AppearanceSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      applyStyles(merged);
      return merged;
    });
  };

  return (
    <AppearanceContext.Provider value={{ ...settings, isLoading, refreshAppearance, updateLocalSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}
