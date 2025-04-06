// statsTracker.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@userStats';

const defaultStats = {
  streak: 0,
  questionsAnswered: 0,
  articlesRead: 0,
  level: 'Beginner',
  timeSpent: 0,
};

// Simple event emitter for stats updates
const listeners = new Set();

export const loadStats = async () => {
  try {
    const savedStats = await AsyncStorage.getItem(STATS_KEY);
    return savedStats ? JSON.parse(savedStats) : defaultStats;
  } catch (error) {
    console.error('Error loading stats:', error);
    return defaultStats;
  }
};

export const saveStats = async (newStats) => {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    // Notify all listeners of the update
    listeners.forEach(callback => callback(newStats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const updateStats = async (type, value) => {
  const currentStats = await loadStats();
  const newStats = { ...currentStats };

  if (type === 'question') {
    newStats.questionsAnswered += value;
  } else if (type === 'time') {
    newStats.timeSpent += value;
  }

  newStats.level = determineLevel(newStats.articlesRead, newStats.questionsAnswered);
  await saveStats(newStats);
  return newStats;
};

export const updateQuestionStats = () => {
  return updateStats('question', 1);
};

const determineLevel = (articles, questions) => {
  const totalActivity = articles + questions;
  if (totalActivity < 10) return 'Beginner';
  if (totalActivity < 30) return 'Learner';
  if (totalActivity < 60) return 'Knowledge Seeker';
  if (totalActivity < 100) return 'Current Affairs Pro';
  return 'Master';
};

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
};

// Subscribe to stats updates
export const subscribeToStats = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback); // Unsubscribe function
};