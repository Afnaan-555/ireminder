import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Battery, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Coffee,
  Music,
  Wind,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { useWellnessStore } from '../stores/wellnessStore';
import { useTaskStore } from '../stores/taskStore';
import { WellnessEntry } from '../types';
import { formatDate } from '../utils/dateUtils';
import { AIAssistant } from '../utils/aiUtils';
import toast from 'react-hot-toast';

const Wellness: React.FC = () => {
  const { 
    wellnessEntries,
    addWellnessEntry,
    getWellnessEntry,
    updateLastBreakTime,
    getAverageMood,
    getAverageEnergy,
    getAverageStress,
    lastBreakTime
  } = useWellnessStore();
  
  const { tasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayEntry, setTodayEntry] = useState<Partial<WellnessEntry>>({
    mood: 3,
    energy: 3,
    stress: 3,
    notes: ''
  });

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  useEffect(() => {
    const existingEntry = getWellnessEntry(selectedDate);
    if (existingEntry) {
      setTodayEntry({
        mood: existingEntry.mood,
        energy: existingEntry.energy,
        stress: existingEntry.stress,
        notes: existingEntry.notes || ''
      });
    } else {
      setTodayEntry({
        mood: 3,
        energy: 3,
        stress: 3,
        notes: ''
      });
    }
  }, [selectedDate, getWellnessEntry]);

  const handleSaveEntry = () => {
    if (!todayEntry.mood || !todayEntry.energy || !todayEntry.stress) {
      toast.error('Please rate all wellness metrics');
      return;
    }

    addWellnessEntry({
      date: selectedDate,
      mood: todayEntry.mood as 1 | 2 | 3 | 4 | 5,
      energy: todayEntry.energy as 1 | 2 | 3 | 4 | 5,
      stress: todayEntry.stress as 1 | 2 | 3 | 4 | 5,
      notes: todayEntry.notes
    });

    toast.success('Wellness entry saved!');
  };

  const handleTakeBreak = () => {
    updateLastBreakTime();
    toast.success('Break time logged! Take care of yourself 🌱');
  };

  const weeklyMood = getAverageMood(7);
  const weeklyEnergy = getAverageEnergy(7);
  const weeklyStress = getAverageStress(7);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  const aiRecommendation = AIAssistant.generateWellnessRecommendation(
    todayEntry.mood || 3,
    todayEntry.energy || 3,
    todayEntry.stress || 3
  );

  const getTimeSinceLastBreak = () => {
    if (!lastBreakTime) return 'No break recorded today';
    
    const now = new Date();
    const diffMs = now.getTime() - lastBreakTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    }
    return `${diffMinutes}m ago`;
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="h-6 w-6 text-green-600" />;
    if (mood >= 3) return <Meh className="h-6 w-6 text-yellow-600" />;
    return <Frown className="h-6 w-6 text-red-600" />;
  };

  const wellnessActivities = [
    {
      title: 'Deep Breathing',
      description: '5-minute breathing exercise',
      icon: Wind,
      color: 'bg-blue-50 text-blue-600',
      action: () => toast.success('Take 5 deep breaths. Inhale for 4, hold for 4, exhale for 6.')
    },
    {
      title: 'Calming Music',
      description: 'Listen to relaxing sounds',
      icon: Music,
      color: 'bg-purple-50 text-purple-600',
      action: () => toast.success('Try nature sounds, classical music, or meditation tracks.')
    },
    {
      title: 'Coffee Break',
      description: 'Take a mindful break',
      icon: Coffee,
      color: 'bg-amber-50 text-amber-600',
      action: () => {
        handleTakeBreak();
        toast.success('Enjoy your break! Stay hydrated and stretch a bit.');
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Wellness Dashboard 🌱
        </h1>
        <p className="text-gray-600">
          Track your well-being and maintain healthy habits
        </p>
      </div>

      {/* AI Wellness Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200"
      >
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wellness Insight
            </h3>
            <h4 className="font-medium text-green-900 mb-1">
              {aiRecommendation.title}
            </h4>
            <p className="text-gray-700">
              {aiRecommendation.description}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Check-in */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Daily Check-in
            </h2>
            <div className="text-sm text-gray-500">
              {formatDate(selectedDate)}
            </div>
          </div>

          <div className="space-y-6">
            {/* Mood */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  {getMoodIcon(todayEntry.mood || 3)}
                  <span className="ml-2">Mood</span>
                </label>
                <span className="text-sm text-gray-500">
                  {todayEntry.mood}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={todayEntry.mood || 3}
                onChange={(e) => setTodayEntry({ ...todayEntry, mood: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Energy */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Battery className="h-5 w-5 text-green-600" />
                  <span className="ml-2">Energy</span>
                </label>
                <span className="text-sm text-gray-500">
                  {todayEntry.energy}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={todayEntry.energy || 3}
                onChange={(e) => setTodayEntry({ ...todayEntry, energy: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Exhausted</span>
                <span>Energized</span>
              </div>
            </div>

            {/* Stress */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="ml-2">Stress</span>
                </label>
                <span className="text-sm text-gray-500">
                  {todayEntry.stress}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={todayEntry.stress || 3}
                onChange={(e) => setTodayEntry({ ...todayEntry, stress: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Calm</span>
                <span>Very Stressed</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes (optional)
              </label>
              <textarea
                value={todayEntry.notes || ''}
                onChange={(e) => setTodayEntry({ ...todayEntry, notes: e.target.value })}
                placeholder="How are you feeling today? Any thoughts or reflections..."
                className="input-field h-20 resize-none"
              />
            </div>

            <button
              onClick={handleSaveEntry}
              className="btn-primary w-full"
            >
              Save Check-in
            </button>
          </div>
        </div>

        {/* Weekly Overview & Activities */}
        <div className="space-y-6">
          {/* Weekly Stats */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Weekly Overview
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {weeklyMood.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Mood</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {weeklyEnergy.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Energy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {weeklyStress.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Stress</div>
              </div>
            </div>
          </div>

          {/* Break Tracker */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Break Tracker
            </h2>
            
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Last break: {getTimeSinceLastBreak()}
              </div>
              <button
                onClick={handleTakeBreak}
                className="btn-secondary"
              >
                Log Break Now
              </button>
            </div>
          </div>

          {/* Wellness Activities */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Wellness Activities
            </h2>
            
            <div className="space-y-3">
              {wellnessActivities.map((activity, index) => (
                <motion.button
                  key={activity.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={activity.action}
                  className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wellness;