import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Calendar,
  Clock,
  AlertTriangle,
  Trash2,
  Edit3
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { Task } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';
import { voiceService } from '../utils/voiceUtils';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTask 
  } = useTaskStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    dueTime: '',
    category: '',
    estimatedDuration: 30,
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const taskData = {
      ...newTask,
      completed: false,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    };

    addTask(taskData);
    
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      category: '',
      estimatedDuration: 30,
    });
    
    setShowAddForm(false);
    toast.success('Task added successfully!');
  };

  const handleToggleTask = (task: Task) => {
    toggleTask(task.id);
    
    if (!task.completed) {
      voiceService.speakTaskComplete(task.title);
      toast.success(`Completed: ${task.title}`);
    }
  };

  const handleDeleteTask = (task: Task) => {
    deleteTask(task.id);
    toast.success('Task deleted');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by completion status first (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by priority
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Finally by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return 0;
  });

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">
            {tasks.filter(t => !t.completed).length} pending • {tasks.filter(t => t.completed).length} completed
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field lg:w-40"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field lg:w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
            
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Task title *"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div className="lg:col-span-2">
                <textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-field h-24 resize-none"
                />
              </div>
              
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                className="input-field"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              
              <input
                type="text"
                placeholder="Category (optional)"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="input-field"
              />
              
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="input-field"
              />
              
              <input
                type="time"
                value={newTask.dueTime}
                onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="btn-primary"
              >
                Add Task
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`card hover:shadow-lg transition-all duration-200 ${
                task.completed ? 'opacity-75' : ''
              } ${isOverdue(task) ? 'border-l-4 border-red-500' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => handleToggleTask(task)}
                  className="mt-1 transition-colors duration-200"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400 hover:text-blue-600" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium text-gray-900 ${
                        task.completed ? 'line-through' : ''
                      }`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        
                        {task.category && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {task.category}
                          </span>
                        )}
                        
                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 text-xs ${
                            isOverdue(task) ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(new Date(task.dueDate))}</span>
                            {task.dueTime && (
                              <>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{task.dueTime}</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        {isOverdue(task) && (
                          <div className="flex items-center space-x-1 text-red-600 text-xs">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sortedTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <CheckCircle2 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterPriority !== 'all' || filterStatus !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks yet'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterPriority !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first task to get started!'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tasks;