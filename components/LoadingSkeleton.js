import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const LoadingSkeleton = () => {
  return (
    <SkeletonPlaceholder>
      <View style={styles.card}>
        <View style={styles.image} />
        <View style={styles.content}>
          <View style={styles.title} />
          <View style={styles.summary} />
          <View style={styles.footer}>
            <View style={styles.source} />
            <View style={styles.time} />
          </View>
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    width: '80%',
    height: 20,
    marginBottom: 8,
  },
  summary: {
    width: '100%',
    height: 16,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  source: {
    width: '30%',
    height: 14,
  },
  time: {
    width: '20%',
    height: 14,
  },
});

export default LoadingSkeleton;