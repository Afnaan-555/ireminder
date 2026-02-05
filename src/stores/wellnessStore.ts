import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WellnessEntry, ProductivityStats } from '../types';

interface WellnessStore {
  wellnessEntries: WellnessEntry[];
  productivityStats: ProductivityStats[];
  lastBreakTime: Date | null;
  
  // Wellness actions
  addWellnessEntry: (entry: Omit<WellnessEntry, 'id'>) => void;
  updateWellnessEntry: (id: string, updates: Partial<WellnessEntry>) => void;
  getWellnessEntry: (date: Date) => WellnessEntry | undefined;
  
  // Productivity actions
  addProductivityStats: (stats: ProductivityStats) => void;
  updateLastBreakTime: () => void;
  getProductivityStats: (date: Date) => ProductivityStats | undefined;
  getWeeklyStats: (startDate: Date) => ProductivityStats[];
  
  // Analytics
  getAverageMood: (days: number) => number;
  getAverageEnergy: (days: number) => number;
  getAverageStress: (days: number) => number;
  getCompletionRate: (days: number) => number;
}

export const useWellnessStore = create<WellnessStore>()(
  persist(
    (set, get) => ({
      wellnessEntries: [],
      productivityStats: [],
      lastBreakTime: null,
      
      addWellnessEntry: (entryData) => {
        const newEntry: WellnessEntry = {
          ...entryData,
          id: crypto.randomUUID(),
        };
        
        set((state) => {
          const existingIndex = state.wellnessEntries.findIndex(
            (entry) => 
              entry.date.toDateString() === entryData.date.toDateString()
          );
          
          if (existingIndex >= 0) {
            const updatedEntries = [...state.wellnessEntries];
            updatedEntries[existingIndex] = newEntry;
            return { wellnessEntries: updatedEntries };
          }
          
          return {
            wellnessEntries: [...state.wellnessEntries, newEntry],
          };
        });
      },
      
      updateWellnessEntry: (id, updates) => {
        set((state) => ({
          wellnessEntries: state.wellnessEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },
      
      getWellnessEntry: (date) => {
        const { wellnessEntries } = get();
        return wellnessEntries.find(
          (entry) => entry.date.toDateString() === date.toDateString()
        );
      },
      
      addProductivityStats: (stats) => {
        set((state) => {
          const existingIndex = state.productivityStats.findIndex(
            (stat) => stat.date.toDateString() === stats.date.toDateString()
          );
          
          if (existingIndex >= 0) {
            const updatedStats = [...state.productivityStats];
            updatedStats[existingIndex] = stats;
            return { productivityStats: updatedStats };
          }
          
          return {
            productivityStats: [...state.productivityStats, stats],
          };
        });
      },
      
      updateLastBreakTime: () => {
        set({ lastBreakTime: new Date() });
      },
      
      getProductivityStats: (date) => {
        const { productivityStats } = get();
        return productivityStats.find(
          (stat) => stat.date.toDateString() === date.toDateString()
        );
      },
      
      getWeeklyStats: (startDate) => {
        const { productivityStats } = get();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        return productivityStats.filter((stat) => {
          const statDate = new Date(stat.date);
          return statDate >= startDate && statDate <= endDate;
        });
      },
      
      getAverageMood: (days) => {
        const { wellnessEntries } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentEntries = wellnessEntries.filter(
          (entry) => new Date(entry.date) >= cutoffDate
        );
        
        if (recentEntries.length === 0) return 0;
        
        const sum = recentEntries.reduce((acc, entry) => acc + entry.mood, 0);
        return sum / recentEntries.length;
      },
      
      getAverageEnergy: (days) => {
        const { wellnessEntries } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentEntries = wellnessEntries.filter(
          (entry) => new Date(entry.date) >= cutoffDate
        );
        
        if (recentEntries.length === 0) return 0;
        
        const sum = recentEntries.reduce((acc, entry) => acc + entry.energy, 0);
        return sum / recentEntries.length;
      },
      
      getAverageStress: (days) => {
        const { wellnessEntries } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentEntries = wellnessEntries.filter(
          (entry) => new Date(entry.date) >= cutoffDate
        );
        
        if (recentEntries.length === 0) return 0;
        
        const sum = recentEntries.reduce((acc, entry) => acc + entry.stress, 0);
        return sum / recentEntries.length;
      },
      
      getCompletionRate: (days) => {
        const { productivityStats } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentStats = productivityStats.filter(
          (stat) => new Date(stat.date) >= cutoffDate
        );
        
        if (recentStats.length === 0) return 0;
        
        const totalCompleted = recentStats.reduce(
          (acc, stat) => acc + stat.tasksCompleted,
          0
        );
        const totalTasks = recentStats.reduce(
          (acc, stat) => acc + stat.totalTasks,
          0
        );
        
        return totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
      },
    }),
    {
      name: 'ireminder-wellness',
    }
  )
);