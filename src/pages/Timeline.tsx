import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  Circle,
  Plus
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { formatDate, formatTime } from '../utils/dateUtils';
import { format, addDays, subDays, startOfDay } from 'date-fns';

const Timeline: React.FC = () => {
  const { tasks, reminders, getTasksByDate } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(current => 
      direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    );
  };

  const dayTasks = getTasksByDate(selectedDate);
  const dayReminders = reminders.filter(reminder => {
    const reminderDate = new Date(reminder.scheduledTime);
    return reminderDate.toDateString() === selectedDate.toDateString();
  });

  // Combine tasks and reminders into timeline events
  const timelineEvents = [
    ...dayTasks.map(task => ({
      id: task.id,
      type: 'task' as const,
      title: task.title,
      time: task.dueTime || '09:00',
      completed: task.completed,
      priority: task.priority,
      description: task.description,
    })),
    ...dayReminders.map(reminder => ({
      id: reminder.id,
      type: 'reminder' as const,
      title: reminder.title,
      time: format(new Date(reminder.scheduledTime), 'HH:mm'),
      completed: reminder.isCompleted,
      description: reminder.message,
    }))
  ].sort((a, b) => a.time.localeCompare(b.time));

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    return timelineEvents.filter(event => 
      event.time.startsWith(hourStr)
    );
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const currentHour = new Date().getHours();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-600">Daily schedule and reminders</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </h2>
            <p className="text-sm text-gray-500">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setSelectedDate(new Date())}
            className="btn-secondary text-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="space-y-1">
          {hours.map(hour => {
            const hourEvents = getEventsForHour(hour);
            const isCurrentHour = isToday && hour === currentHour;
            
            return (
              <motion.div
                key={hour}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: hour * 0.01 }}
                className={`flex border-l-2 ${
                  isCurrentHour ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } pl-4 py-2 min-h-[60px]`}
              >
                <div className="w-16 flex-shrink-0">
                  <div className={`text-sm font-medium ${
                    isCurrentHour ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {format(new Date().setHours(hour, 0), 'h:mm a')}
                  </div>
                </div>
                
                <div className="flex-1 ml-4">
                  {hourEvents.length === 0 ? (
                    <div className="h-full flex items-center">
                      <div className="text-gray-300 text-sm">
                        {isCurrentHour && '← Current time'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {hourEvents.map(event => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            event.completed
                              ? 'bg-green-50 border-green-200'
                              : event.type === 'task'
                              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                              : 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {event.type === 'task' ? (
                              event.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                              ) : (
                                <Circle className="h-5 w-5 text-blue-600 mt-0.5" />
                              )
                            ) : (
                              <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium ${
                                  event.completed ? 'line-through text-gray-600' : 'text-gray-900'
                                }`}>
                                  {event.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {event.time}
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {event.description}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  event.type === 'task'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {event.type}
                                </span>
                                
                                {event.type === 'task' && 'priority' in event && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    event.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    event.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {event.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {dayTasks.length}
          </div>
          <div className="text-sm text-gray-600">Tasks Scheduled</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {dayReminders.length}
          </div>
          <div className="text-sm text-gray-600">Reminders Set</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {dayTasks.filter(t => t.completed).length + dayReminders.filter(r => r.isCompleted).length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Empty State */}
      {timelineEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No events scheduled
          </h3>
          <p className="text-gray-600 mb-6">
            {isToday 
              ? "Add some tasks or reminders to organize your day"
              : `No events scheduled for ${formatDate(selectedDate)}`
            }
          </p>
          <button className="btn-primary inline-flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Timeline;