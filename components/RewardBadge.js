import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RewardBadge = ({ points, badges }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Points: {points}</Text>
      <Text style={styles.text}>Badges: {badges.join(', ')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 16,
  },
});

export default RewardBadge;