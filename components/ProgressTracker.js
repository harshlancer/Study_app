import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { loadStats, subscribeToStats, updateStats, formatTime } from '../services/statsTracker';

const ProgressTracker = ({ navigation }) => {
  const [stats, setStats] = React.useState({
    streak: 0,
    questionsAnswered: 0,
    articlesRead: 0,
    level: 'Beginner',
    timeSpent: 0,
  });
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());

  const calculateProgress = (questions) => {
    if (questions < 10) return '10%';
    if (questions < 25) return '25%';
    if (questions < 50) return '50%';
    if (questions < 100) return '75%';
    return '100%';
  };

  useEffect(() => {
    const initStats = async () => {
      const loadedStats = await loadStats();
      setStats(loadedStats);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    };
    initStats();

    // Subscribe to stats updates
    const unsubscribe = subscribeToStats((newStats) => {
      setStats(newStats);
    });

    // Cleanup
    return () => {
      unsubscribe();
      const timeSpentThisSession = Math.floor((Date.now() - startTime.current) / 1000);
      updateStats('time', timeSpentThisSession);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', calculateProgress(stats.questionsAnswered)],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <View style={styles.streakContainer}>
          <Icon name="fire" size={18} color="#FF5722" />
          <Text style={styles.streakText}>{stats.streak} day streak</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
          <Icon name="chevron-right" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[styles.progressBar, { width: progressWidth }]} 
        />
        <Text style={styles.levelText}>{stats.level}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.questionsAnswered}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.articlesRead}</Text>
          <Text style={styles.statLabel}>Articles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(stats.timeSpent)}</Text>
          <Text style={styles.statLabel}>Time Spent</Text>
        </View>
      </View>
    </View>
  );
};
export default ProgressTracker;

const styles = StyleSheet.create({
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#FFF',
    marginLeft: 5,
    fontWeight: '500',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFF',
    opacity: 0.8,
    marginRight: 3,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5D5DFB',
    borderRadius: 6,
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    position: 'absolute',
    right: 8,
    top: -16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 12,
    marginTop: 2,
  }
});
