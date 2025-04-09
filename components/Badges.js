// components/Badges.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BADGE_CRITERIA } from '../services/statsTracker';

const Badge = ({ badge, unlocked }) => (
  <View style={[styles.badgeContainer, !unlocked && styles.lockedBadge]}>
    <Icon 
      name={unlocked ? badge.icon : 'lock'} 
      size={32} 
      color={unlocked ? '#FFD700' : '#666'} 
    />
    <Text style={styles.badgeText}>{badge.name}</Text>
    {!unlocked && <Text style={styles.requirementText}>{getRequirementText(badge)}</Text>}
  </View>
);

const getRequirementText = (badge) => {
  if (badge.id.includes('streak')) return `${badge.threshold} consecutive days`;
  if (badge.id.includes('questions')) return `${badge.threshold} questions`;
  if (badge.id.includes('articles')) return `${badge.threshold} articles`;
  if (badge.id.includes('time')) return `${Math.floor(badge.threshold/3600)} hours`;
  return '';
};

const Badges = ({ unlockedBadges = [] }) => (  
  <View style={styles.container}>
    <Text style={styles.title}>Achievements</Text>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={Object.values(BADGE_CRITERIA)}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Badge 
          badge={item} 
          unlocked={unlockedBadges.includes(item.id)} 
        />
      )}
      contentContainerStyle={styles.list}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    paddingRight: 16,
  },
  badgeContainer: {
    width: 100,
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#3A3A3A',
  },
  lockedBadge: {
    opacity: 0.6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  requirementText: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default Badges;