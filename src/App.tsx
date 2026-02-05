import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Timeline from './pages/Timeline';
import Wellness from './pages/Wellness';
import Settings from './pages/Settings';
import { useSettingsStore } from './stores/settingsStore';
import { voiceService } from './utils/voiceUtils';
import { notificationService } from './utils/notificationUtils';

function App() {
  const { voiceOutput, notifications } = useSettingsStore();

  useEffect(() => {
    // Initialize services
    voiceService.setEnabled(voiceOutput);
    
    if (notifications) {
      notificationService.requestPermission();
    }

    // Welcome message on first load
    const hasVisited = localStorage.getItem('ireminder-visited');
    if (!hasVisited && voiceOutput) {
      setTimeout(() => {
        voiceService.speakWelcome();
      }, 1000);
      localStorage.setItem('ireminder-visited', 'true');
    }
  }, [voiceOutput, notifications]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </motion.div>
  );
}

export default App;