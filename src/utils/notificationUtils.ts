class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkPermission();
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      requireInteraction?: boolean;
      actions?: NotificationAction[];
    }
  ): Promise<Notification | null> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      return null;
    }

    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/pwa-192x192.png',
      badge: options?.badge || '/pwa-192x192.png',
      tag: options?.tag,
      requireInteraction: options?.requireInteraction || false,
      actions: options?.actions,
    });

    return notification;
  }

  async showReminderNotification(
    title: string,
    message: string,
    reminderId: string
  ): Promise<Notification | null> {
    return this.showNotification(`⏰ ${title}`, {
      body: message,
      tag: `reminder-${reminderId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'complete',
          title: 'Mark Complete',
        },
        {
          action: 'snooze',
          title: 'Snooze 10min',
        },
      ],
    });
  }

  async showTaskDueNotification(
    taskTitle: string,
    dueTime: string
  ): Promise<Notification | null> {
    return this.showNotification(`📋 Task Due`, {
      body: `"${taskTitle}" is due ${dueTime}`,
      tag: 'task-due',
      requireInteraction: false,
    });
  }

  async showBreakReminder(): Promise<Notification | null> {
    return this.showNotification(`🧘 Break Time`, {
      body: 'Time to take a break and recharge!',
      tag: 'break-reminder',
      requireInteraction: false,
    });
  }

  async showMotivationalNotification(message: string): Promise<Notification | null> {
    return this.showNotification(`✨ Stay Motivated`, {
      body: message,
      tag: 'motivation',
      requireInteraction: false,
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }
}

export const notificationService = new NotificationService();