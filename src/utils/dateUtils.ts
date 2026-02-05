import { format, isToday, isTomorrow, isYesterday, startOfDay, endOfDay } from 'date-fns';

export const formatDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

export const isOverdue = (date: Date): boolean => {
  return date < new Date();
};

export const getDayStart = (date: Date): Date => {
  return startOfDay(date);
};

export const getDayEnd = (date: Date): Date => {
  return endOfDay(date);
};

export const getTimeUntil = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return 'Overdue';
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  
  return 'Now';
};

export const createDateFromTimeString = (timeString: string, date?: Date): Date => {
  const baseDate = date || new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const newDate = new Date(baseDate);
  newDate.setHours(hours, minutes, 0, 0);
  
  return newDate;
};