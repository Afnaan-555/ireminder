export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  dueTime?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  estimatedDuration?: number; // in minutes
}

export interface Reminder {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  scheduledTime: Date;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  isCompleted: boolean;
  snoozeCount: number;
  createdAt: Date;
}

export interface WellnessEntry {
  id: string;
  date: Date;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface ProductivityStats {
  date: Date;
  tasksCompleted: number;
  totalTasks: number;
  focusTime: number; // in minutes
  breaksTaken: number;
}

export interface AppSettings {
  notifications: boolean;
  voiceOutput: boolean;
  theme: 'light' | 'dark' | 'auto';
  workingHours: {
    start: string;
    end: string;
  };
  breakReminders: boolean;
  breakInterval: number; // in minutes
}

export interface AIRecommendation {
  id: string;
  type: 'task_order' | 'break' | 'wellness' | 'focus';
  title: string;
  description: string;
  priority: number;
  createdAt: Date;
}