import { Task, AIRecommendation } from '../types';

export class AIAssistant {
  static generateTaskOrderRecommendation(tasks: Task[]): AIRecommendation {
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    if (incompleteTasks.length === 0) {
      return {
        id: crypto.randomUUID(),
        type: 'task_order',
        title: 'All caught up!',
        description: 'Great job! You\'ve completed all your tasks. Consider adding new goals or taking a well-deserved break.',
        priority: 1,
        createdAt: new Date(),
      };
    }

    // Sort by priority and due date
    const sortedTasks = incompleteTasks.sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });

    const nextTask = sortedTasks[0];
    const timeOfDay = new Date().getHours();
    
    let suggestion = '';
    if (timeOfDay < 10) {
      suggestion = 'Start your day strong with your highest priority task';
    } else if (timeOfDay < 14) {
      suggestion = 'Perfect time to tackle important work while your energy is high';
    } else if (timeOfDay < 17) {
      suggestion = 'Keep the momentum going with this important task';
    } else {
      suggestion = 'Finish strong with this priority item';
    }

    return {
      id: crypto.randomUUID(),
      type: 'task_order',
      title: `Focus on: ${nextTask.title}`,
      description: `${suggestion}. This ${nextTask.priority} priority task ${nextTask.dueDate ? 'is due soon' : 'needs your attention'}.`,
      priority: 3,
      createdAt: new Date(),
    };
  }

  static generateBreakRecommendation(lastBreakTime: Date | null): AIRecommendation | null {
    const now = new Date();
    const timeSinceBreak = lastBreakTime 
      ? (now.getTime() - lastBreakTime.getTime()) / (1000 * 60) // minutes
      : 120; // assume 2 hours if no break recorded

    if (timeSinceBreak < 45) {
      return null; // Too soon for break recommendation
    }

    const breakActivities = [
      'Take a 5-minute walk around your space',
      'Do some gentle stretching exercises',
      'Practice deep breathing for 2-3 minutes',
      'Step outside for fresh air',
      'Hydrate with a glass of water',
      'Do some quick desk exercises',
    ];

    const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];

    return {
      id: crypto.randomUUID(),
      type: 'break',
      title: 'Time for a break!',
      description: `You've been focused for ${Math.round(timeSinceBreak)} minutes. ${randomActivity} to recharge your energy.`,
      priority: 2,
      createdAt: new Date(),
    };
  }

  static generateWellnessRecommendation(mood: number, energy: number, stress: number): AIRecommendation {
    let title = '';
    let description = '';
    let priority = 1;

    if (stress >= 4) {
      title = 'Stress Management';
      description = 'Your stress levels seem high. Try a 5-minute meditation, listen to calming music, or practice progressive muscle relaxation.';
      priority = 3;
    } else if (energy <= 2) {
      title = 'Energy Boost';
      description = 'Feeling low energy? Consider a short walk, some light stretching, or a healthy snack to naturally boost your energy.';
      priority = 2;
    } else if (mood <= 2) {
      title = 'Mood Lift';
      description = 'Here are some mood boosters: listen to your favorite music, call a friend, or write down three things you\'re grateful for.';
      priority = 2;
    } else {
      title = 'Keep up the great work!';
      description = 'You\'re doing well today. Maintain this positive momentum by staying hydrated and taking regular breaks.';
      priority = 1;
    }

    return {
      id: crypto.randomUUID(),
      type: 'wellness',
      title,
      description,
      priority,
      createdAt: new Date(),
    };
  }

  static generateFocusRecommendation(completedTasks: number, totalTasks: number): AIRecommendation {
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    let title = '';
    let description = '';
    let priority = 1;

    if (completionRate >= 80) {
      title = 'Excellent progress!';
      description = 'You\'re crushing your goals today! Keep this momentum going and consider tackling one more challenging task.';
      priority = 1;
    } else if (completionRate >= 50) {
      title = 'Good momentum';
      description = 'You\'re making solid progress. Focus on your highest priority remaining tasks to maximize your impact.';
      priority = 2;
    } else if (completionRate >= 25) {
      title = 'Time to focus';
      description = 'Let\'s pick up the pace! Try the Pomodoro technique: 25 minutes of focused work, then a 5-minute break.';
      priority = 2;
    } else {
      title = 'Fresh start opportunity';
      description = 'Every moment is a chance to begin again. Choose one small task and complete it to build momentum.';
      priority = 3;
    }

    return {
      id: crypto.randomUUID(),
      type: 'focus',
      title,
      description,
      priority,
      createdAt: new Date(),
    };
  }

  static getMotivationalQuote(): string {
    const quotes = [
      "The way to get started is to quit talking and begin doing. - Walt Disney",
      "Don't let yesterday take up too much of today. - Will Rogers",
      "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
      "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you. - Steve Jobs",
      "The future depends on what you do today. - Mahatma Gandhi",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Progress, not perfection, is the goal.",
      "Small steps daily lead to big changes yearly.",
      "Your only limit is your mind.",
    ];

    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}