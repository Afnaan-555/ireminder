import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Volume2, 
  Clock,
  Coffee,
  Moon,
  Sun,
  Smartphone,
  Save
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { voiceService } from '../utils/voiceUtils';
import { notificationService } from '../utils/notificationUtils';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const {
    notifications,
    voiceOutput,
    theme,
    workingHours,
    breakReminders,
    breakInterval,
    updateSettings
  } = useSettingsStore();

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await notificationService.requestPermission();
      if (!hasPermission) {
        toast.error('Notification permission denied');
        return;
      }
    }
    
    updateSettings({ notifications: enabled });
    toast.success(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleToggleVoice = (enabled: boolean) => {
    voiceService.setEnabled(enabled);
    updateSettings({ voiceOutput: enabled });
    
    if (enabled) {
      voiceService.speak('Voice output is now enabled');
    }
    
    toast.success(`Voice output ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    updateSettings({
      workingHours: {
        ...workingHours,
        [field]: value
      }
    });
  };

  const handleBreakIntervalChange = (interval: number) => {
    updateSettings({ breakInterval: interval });
    toast.success(`Break reminders set to every ${interval} minutes`);
  };

  const testVoice = () => {
    voiceService.speak('This is a test of the voice output feature. How does it sound?');
  };

  const testNotification = async () => {
    const notification = await notificationService.showNotification(
      'Test Notification',
      {
        body: 'This is a test notification from iReminder!',
        requireInteraction: false
      }
    );
    
    if (notification) {
      toast.success('Test notification sent!');
    } else {
      toast.error('Could not send notification');
    }
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Enable Notifications',
          description: 'Receive browser notifications for reminders and tasks',
          type: 'toggle' as const,
          value: notifications,
          onChange: handleToggleNotifications,
          testAction: testNotification,
          testLabel: 'Test Notification'
        }
      ]
    },
    {
      title: 'Voice & Audio',
      icon: Volume2,
      settings: [
        {
          label: 'Voice Output',
          description: 'Hear spoken reminders and task completions',
          type: 'toggle' as const,
          value: voiceOutput,
          onChange: handleToggleVoice,
          testAction: testVoice,
          testLabel: 'Test Voice'
        }
      ]
    },
    {
      title: 'Working Hours',
      icon: Clock,
      settings: [
        {
          label: 'Start Time',
          description: 'When your work day begins',
          type: 'time' as const,
          value: workingHours.start,
          onChange: (value: string) => handleWorkingHoursChange('start', value)
        },
        {
          label: 'End Time',
          description: 'When your work day ends',
          type: 'time' as const,
          value: workingHours.end,
          onChange: (value: string) => handleWorkingHoursChange('end', value)
        }
      ]
    },
    {
      title: 'Break Reminders',
      icon: Coffee,
      settings: [
        {
          label: 'Enable Break Reminders',
          description: 'Get reminded to take regular breaks',
          type: 'toggle' as const,
          value: breakReminders,
          onChange: (value: boolean) => updateSettings({ breakReminders: value })
        },
        {
          label: 'Break Interval',
          description: 'How often to remind you to take breaks',
          type: 'select' as const,
          value: breakInterval,
          onChange: handleBreakIntervalChange,
          options: [
            { value: 30, label: 'Every 30 minutes' },
            { value: 45, label: 'Every 45 minutes' },
            { value: 60, label: 'Every hour' },
            { value: 90, label: 'Every 90 minutes' },
            { value: 120, label: 'Every 2 hours' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center lg:justify-start">
          <SettingsIcon className="h-8 w-8 mr-3 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">
          Customize your iReminder experience
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <section.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
            </div>

            <div className="space-y-6">
              {section.settings.map((setting, settingIndex) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {setting.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {setting.type === 'toggle' && (
                      <>
                        <button
                          onClick={() => setting.onChange(!(setting.value as boolean))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            setting.value ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              setting.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        {setting.testAction && (
                          <button
                            onClick={setting.testAction}
                            className="btn-secondary text-sm"
                          >
                            {setting.testLabel}
                          </button>
                        )}
                      </>
                    )}

                    {setting.type === 'time' && (
                      <input
                        type="time"
                        value={setting.value as string}
                        onChange={(e) => setting.onChange(e.target.value)}
                        className="input-field w-32"
                      />
                    )}

                    {setting.type === 'select' && (
                      <select
                        value={setting.value}
                        onChange={(e) => setting.onChange(parseInt(e.target.value))}
                        className="input-field w-48"
                      >
                        {setting.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            About iReminder
          </h2>
          <p className="text-gray-600 mb-4">
            Your smart productivity and wellness companion
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">v1.0</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">PWA</div>
              <div className="text-sm text-gray-600">Offline Ready</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">Local</div>
              <div className="text-sm text-gray-600">Privacy First</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">AI</div>
              <div className="text-sm text-gray-600">Smart Assistant</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-gray-700">
              All your data is stored locally on your device. No accounts required, 
              no data sent to servers. Your privacy is our priority.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (voiceOutput) {
                voiceService.speak('Welcome back to iReminder! Ready to be productive?');
              }
              toast.success('Settings saved successfully!');
            }}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </button>
          
          <button
            onClick={() => {
              // Reset to defaults would go here
              toast.success('Settings reset to defaults');
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;