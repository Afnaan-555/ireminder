import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Brain,
  Calendar,
  Target
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useWellnessStore } from '../stores/wellnessStore';
import { formatDate, getTimeUntil } from '../utils/dateUtils';
import { AIAssistant } from '../utils/aiUtils';
import { AIRecommendation } from '../types';

const Dashboard: React.FC = () => {
  const { tasks, getOverdueTasks, getUpcomingReminders } = useTaskStore();
  const { 
    getCompletionRate, 
    getAverageMood, 
    getAverageEnergy,
    lastBreakTime,
    getProductivityStats 
  } = useWellnessStore();
  
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);

  const today = new Date();
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  const completedToday = todayTasks.filter(task => task.completed).length;
  const overdueTasks = getOverdueTasks();
  const upcomingReminders = getUpcomingReminders();
  const weeklyCompletionRate = getCompletionRate(7);
  const averageMood = getAverageMood(7);
  const averageEnergy = getAverageEnergy(7);
  const todayStats = getProductivityStats(today);

  useEffect(() => {
    // Generate AI recommendation
    const taskRecommendation = AIAssistant.generateTaskOrderRecommendation(tasks);
    const breakRecommendation = AIAssistant.generateBreakRecommendation(lastBreakTime);
    
    // Choose the highest priority recommendation
    if (breakRecommendation && breakRecommendation.priority >= taskRecommendation.priority) {
      setAiRecommendation(breakRecommendation);
    } else {
      setAiRecommendation(taskRecommendation);
    }
  }, [tasks, lastBreakTime]);

  const stats = [
    {
      title: 'Today\'s Tasks',
      value: `${completedToday}/${todayTasks.length}`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Overdue',
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Upcoming',
      value: upcomingReminders.length,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Weekly Rate',
      value: `${Math.round(weeklyCompletionRate)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center lg:text-left"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          {formatDate(today)} • Let's make today productive
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation */}
      {aiRecommendation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Assistant Suggestion
              </h3>
              <h4 className="font-medium text-blue-900 mb-1">
                {aiRecommendation.title}
              </h4>
              <p className="text-gray-700">
                {aiRecommendation.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Today's Focus
            </h2>
            <span className="text-sm text-gray-500">
              {completedToday}/{todayTasks.length} completed
            </span>
          </div>
          
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No tasks scheduled for today. Great time to plan ahead! 🎯
              </p>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    task.completed
                      ? 'bg-green-50 text-green-800'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${
                      task.completed ? 'line-through' : ''
                    }`}>
                      {task.title}
                    </p>
                    {task.dueTime && (
                      <p className="text-sm text-gray-500">
                        Due at {task.dueTime}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming & Wellness */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Upcoming Reminders */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Upcoming Reminders
            </h2>
            
            <div className="space-y-3">
              {upcomingReminders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No upcoming reminders ✨
                </p>
              ) : (
                upcomingReminders.slice(0, 3).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-blue-900">
                        {reminder.title}
                      </p>
                      <p className="text-sm text-blue-700">
                        {getTimeUntil(new Date(reminder.scheduledTime))}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Wellness Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Weekly Wellness
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {averageMood.toFixed(1)}/5
                </div>
                <div className="text-sm text-gray-600">Avg Mood</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {averageEnergy.toFixed(1)}/5
                </div>
                <div className="text-sm text-gray-600">Avg Energy</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                {averageMood >= 4 && averageEnergy >= 4
                  ? "You're doing great! Keep up the positive momentum! 🌟"
                  : averageMood >= 3 && averageEnergy >= 3
                  ? "Good balance! Consider small wellness activities. 🌱"
                  : "Focus on self-care and take breaks when needed. 💙"
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;