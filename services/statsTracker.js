// statsTracker.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@userStats';
const LAST_ACTIVITY_KEY = '@lastActivityDate';

export const defaultStats = {
  streak: 0,
  questionsAnswered: 0,
  articlesRead: 0,
  level: 'Beginner',
  timeSpent: 0, // Time in seconds
  unlockedBadges: [], // Explicitly an empty array
};

export const BADGE_CRITERIA = {
  STREAK_3: { id: '3_day_streak', name: '3-Day Streak', threshold: 3, icon: 'fire' },
  STREAK_7: { id: '7_day_streak', name: '7-Day Streak', threshold: 7, icon: 'fire' },
  QUESTION_MASTER: { id: '100_questions', name: 'Question Master', threshold: 100, icon: 'lightbulb-on' },
  TIME_INVESTOR_1H: { id: '1_hour', name: '1 Hour Learner', threshold: 3600, icon: 'clock' }, // 1 hour
  TIME_INVESTOR_10H: { id: '10_hours', name: 'Time Investor', threshold: 36000, icon: 'clock' }, // 10 hours
};

const checkBadgeUnlocks = (newStats) => {
  // Ensure unlockedBadges is an array, default to empty if undefined
  const currentBadges = Array.isArray(newStats.unlockedBadges) ? newStats.unlockedBadges : [];
  const unlocked = [];
  
  Object.values(BADGE_CRITERIA).forEach(badge => {
    const hasBadge = currentBadges.includes(badge.id);
    let meetsCriteria = false;

    if (badge.id.includes('streak')) {
      meetsCriteria = newStats.streak >= badge.threshold;
    } else if (badge.id.includes('questions')) {
      meetsCriteria = newStats.questionsAnswered >= badge.threshold;
    } else if (badge.id.includes('hours') || badge.id.includes('hour')) {
      meetsCriteria = newStats.timeSpent >= badge.threshold;
    }

    if (meetsCriteria && !hasBadge) {
      unlocked.push(badge.id);
    }
  });

  return [...new Set([...currentBadges, ...unlocked])];
};

const listeners = new Set();

export const loadStats = async () => {
  try {
    const savedStats = await AsyncStorage.getItem(STATS_KEY);
    const parsedStats = savedStats ? JSON.parse(savedStats) : defaultStats;
    // Ensure unlockedBadges is always an array
    return {
      ...defaultStats,
      ...parsedStats,
      unlockedBadges: Array.isArray(parsedStats.unlockedBadges) ? parsedStats.unlockedBadges : [],
    };
  } catch (error) {
    console.error('Error loading stats:', error);
    return { ...defaultStats }; // Return a copy of defaultStats with unlockedBadges as array
  }
};

export const saveStats = async (newStats) => {
  try {
    // Ensure unlockedBadges is an array before saving
    const safeStats = {
      ...newStats,
      unlockedBadges: Array.isArray(newStats.unlockedBadges) ? newStats.unlockedBadges : [],
    };
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(safeStats));
    listeners.forEach(callback => callback(safeStats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const updateStats = async (type, value) => {
  const currentStats = await loadStats();
  const newStats = { 
    ...currentStats,
    level: determineLevel(currentStats.timeSpent), // Level based on timeSpent
  };

  if (type === 'question') {
    newStats.questionsAnswered += value;
  } else if (type === 'article') {
    newStats.articlesRead += value;
  } else if (type === 'time') {
    newStats.timeSpent += value;
  }

  newStats.unlockedBadges = checkBadgeUnlocks(newStats);
  await saveStats(newStats);
  return newStats;
};

const updateStreak = async () => {
  const currentStats = await loadStats();
  const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
  const today = new Date().toDateString();
  let newStreak = currentStats.streak;

  if (!lastActivity) {
    newStreak = 1;
  } else {
    const lastDate = new Date(lastActivity);
    const currentDate = new Date();
    const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1;
  }

  const newStats = {
    ...currentStats,
    streak: newStreak,
    unlockedBadges: checkBadgeUnlocks({ ...currentStats, streak: newStreak }),
  };

  await AsyncStorage.setItem(LAST_ACTIVITY_KEY, today);
  await saveStats(newStats);
  return newStats;
};

export const updateTimeSpent = (seconds) => updateStats('time', seconds);
export const updateQuestionStats = () => updateStats('question', 1);
export const updateArticleStats = () => updateStats('article', 1);

const determineLevel = (timeSpent) => {
  if (timeSpent < 3600) return 'Beginner'; // < 1 hour
  if (timeSpent < 10800) return 'Learner'; // < 3 hours
  if (timeSpent < 21600) return 'Knowledge Seeker'; // < 6 hours
  if (timeSpent < 36000) return 'Current Affairs Pro'; // < 10 hours
  return 'Master'; // >= 10 hours
};

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
};

export const subscribeToStats = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};