import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { loadStats, formatTime, BADGE_CRITERIA } from '../services/statsTracker';

const { width } = Dimensions.get('window');
const SCREEN_WIDTH = width - 60;

const levelBadges = {
  Beginner: { icon: 'seed', color: '#4CAF50', gradient: ['#388E3C', '#81C784'] },
  Learner: { icon: 'leaf', color: '#8BC34A', gradient: ['#689F38', '#AED581'] },
  'Knowledge Seeker': { icon: 'flower', color: '#FFC107', gradient: ['#FFA000', '#FFECB3'] },
  'Current Affairs Pro': { icon: 'tree', color: '#FF9800', gradient: ['#F57C00', '#FFCC80'] },
  Master: { icon: 'star', color: '#F44336', gradient: ['#D32F2F', '#EF9A9A'] },
};

const AchievementsScreen = () => {
  const [stats, setStats] = useState({
    streak: 0,
    questionsAnswered: 0,
    articlesRead: 0,
    level: 'Beginner',
    timeSpent: 0,
    unlockedBadges: [],
  });
  const [activeTab, setActiveTab] = useState('stats');
  const scrollViewRef = useRef(null);
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    const initializeStats = async () => {
      try {
        const loadedStats = await loadStats();
        setStats(loadedStats);
        animationProgress.value = withTiming(1, { duration: 1500 });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    initializeStats();
  }, []);

  const calculateTimeProgress = useCallback((timeSpent) => {
    const maxTime = 36000; // 10 hours
    return Math.min((timeSpent / maxTime) * 100, 100);
  }, []);

  const animatedStatStyle = useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    transform: [{
      scale: animationProgress.value
    }]
  }));

  const renderHeader = useCallback(() => (
    <LinearGradient
      colors={[
        '#121212',
        '#1E1E1E',
        ...levelBadges[stats.level].gradient.map(color => `${color}20`)
      ]}
      style={styles.header}
    >
      <LinearGradient
        colors={levelBadges[stats.level].gradient}
        style={styles.levelIconContainer}
      >
        <Icon name={levelBadges[stats.level].icon} size={40} color="#FFFFFF" />
      </LinearGradient>
      <Text style={styles.headerTitle}>{stats.level}</Text>
      <Text style={styles.headerSubtitle}>Your Achievements</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabel}>Progress to Master</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(calculateTimeProgress(stats.timeSpent))}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={['#5D5DFB', '#7878FF']}
            style={[styles.progressBar, { width: `${calculateTimeProgress(stats.timeSpent)}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{formatTime(stats.timeSpent)} / 10h</Text>
      </View>
    </LinearGradient>
  ), [stats.level, stats.timeSpent, calculateTimeProgress]);

  const renderStatsOverview = useCallback(() => {
    const statItems = [
      { icon: 'fire', colors: ['#FF5722', '#FF8A65'], value: stats.streak, label: 'Day Streak' },
      { icon: 'clock', colors: ['#5D5DFB', '#7878FF'], value: formatTime(stats.timeSpent), label: 'Time Spent' },
      { icon: 'lightbulb-on', colors: ['#FFC107', '#FFD54F'], value: stats.questionsAnswered, label: 'Questions' },
      { icon: 'book-open', colors: ['#4CAF50', '#81C784'], value: stats.articlesRead, label: 'Articles' },
    ];

    return (
      <View style={styles.statsContainer}>
        {statItems.map((item, index) => (
          <Animated.View key={index} style={[styles.statCard, animatedStatStyle]}>
            <LinearGradient colors={item.colors} style={styles.statIconContainer}>
              <Icon name={item.icon} size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Animated.View>
        ))}
      </View>
    );
  }, [stats, animatedStatStyle]);

  const renderCharts = useCallback(() => {
    const chartConfig = {
      backgroundGradientFrom: '#1A1A1A',
      backgroundGradientTo: '#2A2A2A',
      color: (opacity = 1) => `rgba(93, 93, 251, ${opacity})`,
      labelColor: () => '#FFF',
    };

    const timeData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [
          stats.timeSpent * 0.1,
          stats.timeSpent * 0.2,
          stats.timeSpent * 0.15,
          stats.timeSpent * 0.25,
          stats.timeSpent * 0.3,
          stats.timeSpent * 0.4,
          stats.timeSpent / 3600
        ],
      }],
    };

    const pieData = [
      { name: 'Questions', value: stats.questionsAnswered, color: '#5D5DFB' },
      { name: 'Articles', value: stats.articlesRead, color: '#FF5722' },
      { name: 'Idle', value: Math.max(1, 10 - (stats.questionsAnswered + stats.articlesRead)), color: '#888' },
    ].filter(item => item.value > 0);

    const progressData = {
      labels: ["Reading", "Questions", "Streaks"],
      data: [stats.articlesRead/100, stats.questionsAnswered/100, stats.streak/30],
    };

    return (
      <View style={styles.chartsContainer}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          <LineChart
            data={timeData}
            width={SCREEN_WIDTH}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Activity Distribution</Text>
          <PieChart
            data={pieData}
            width={SCREEN_WIDTH}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Goal Progress</Text>
          <ProgressChart
            data={progressData}
            width={SCREEN_WIDTH}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>
      </View>
    );
  }, [stats]);

  const renderBadges = useCallback(() => (
    <View style={styles.badgesContainer}>
      <Text style={styles.sectionTitle}>Achievement Badges</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.values(BADGE_CRITERIA).map((badge) => {
          const isUnlocked = stats.unlockedBadges.includes(badge.id);
          return (
            <TouchableOpacity key={badge.id} style={styles.badgeItem}>
              <LinearGradient
                colors={isUnlocked ? ['#5D5DFB', '#7878FF'] : ['#333', '#444']}
                style={styles.badgeGradient}
              >
                <Icon name={badge.icon} size={34} color={isUnlocked ? '#FFF' : '#888'} />
              </LinearGradient>
              <Text style={[styles.badgeText, { color: isUnlocked ? '#FFF' : '#888' }]}>
                {badge.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  ), [stats.unlockedBadges]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderStatsOverview()}
        {activeTab === 'stats' ? renderCharts() : renderBadges()}
      </ScrollView>
      <View style={styles.tabBar}>
        {['stats', 'badges'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Icon
              name={tab === 'stats' ? 'chart-bar' : 'shield-star'}
              size={24}
              color={activeTab === tab ? '#5D5DFB' : '#AAA'}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { paddingBottom: 80 },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  levelIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  headerSubtitle: { color: '#AAA', fontSize: 16, marginTop: 5 },
  progressContainer: { width: '100%', marginTop: 20 },
  progressLabelContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  progressPercentage: { color: '#5D5DFB', fontSize: 16, fontWeight: 'bold' },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    marginTop: 5,
  },
  progressBar: { height: '100%', borderRadius: 6 },
  progressText: { color: '#AAA', fontSize: 14, textAlign: 'right', marginTop: 5 },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#AAA', fontSize: 14, marginTop: 5 },
  chartsContainer: { paddingHorizontal: 20 },
  chartCard: { backgroundColor: '#2A2A2A', borderRadius: 16, padding: 15, marginBottom: 20 },
  chartTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 10 },
  chart: { borderRadius: 12 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  badgesContainer: { paddingHorizontal: 20 },
  badgeItem: { alignItems: 'center', marginRight: 20 },
  badgeGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTab: { borderTopWidth: 2, borderTopColor: '#5D5DFB' },
  tabText: { color: '#AAA', marginTop: 4, fontSize: 12 },
  activeTabText: { color: '#5D5DFB', fontWeight: '600' },
});

export default AchievementsScreen;