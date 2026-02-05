import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Reminder } from '../types';

interface TaskStore {
  tasks: Task[];
  reminders: Reminder[];
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  // Reminder actions
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  
  // Utility functions
  getTasksByDate: (date: Date) => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingReminders: () => Reminder[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      reminders: [],
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          reminders: state.reminders.filter((reminder) => reminder.taskId !== id),
        }));
      },
      
      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      addReminder: (reminderData) => {
        const newReminder: Reminder = {
          ...reminderData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));
      },
      
      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, ...updates } : reminder
          ),
        }));
      },
      
      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        }));
      },
      
      snoozeReminder: (id, minutes) => {
        const newTime = new Date();
        newTime.setMinutes(newTime.getMinutes() + minutes);
        
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id
              ? {
                  ...reminder,
                  scheduledTime: newTime,
                  snoozeCount: reminder.snoozeCount + 1,
                }
              : reminder
          ),
        }));
      },
      
      getTasksByDate: (date) => {
        const { tasks } = get();
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return (
            taskDate.getDate() === date.getDate() &&
            taskDate.getMonth() === date.getMonth() &&
            taskDate.getFullYear() === date.getFullYear()
          );
        });
      },
      
      getOverdueTasks: () => {
        const { tasks } = get();
        const now = new Date();
        return tasks.filter((task) => {
          if (!task.dueDate || task.completed) return false;
          return new Date(task.dueDate) < now;
        });
      },
      
      getUpcomingReminders: () => {
        const { reminders } = get();
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        
        return reminders.filter((reminder) => {
          if (reminder.isCompleted) return false;
          const reminderTime = new Date(reminder.scheduledTime);
          return reminderTime >= now && reminderTime <= nextHour;
        });
      },
    }),
    {
      name: 'ireminder-tasks',
    }
  )
);