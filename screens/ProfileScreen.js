import React from 'react';
import { View, Text } from 'react-native';
import useRewards from '../hooks/useRewards';

const ProfileScreen = () => {
  const { points, badges } = useRewards();

  return (
    <View>
      <Text>Points: {points}</Text>
      <Text>Badges: {badges.join(', ')}</Text>
    </View>
  );
};

export default ProfileScreen;