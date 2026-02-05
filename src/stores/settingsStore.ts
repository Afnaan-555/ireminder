import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '../types';

interface SettingsStore extends AppSettings {
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  notifications: true,
  voiceOutput: true,
  theme: 'light',
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
  breakReminders: true,
  breakInterval: 60, // 60 minutes
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateSettings: (newSettings) => {
        set((state) => ({
          ...state,
          ...newSettings,
        }));
      },
      
      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'ireminder-settings',
    }
  )
);