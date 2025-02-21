import React from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import CategoryBar from '../components/CategoryBar';
import NewsCard from '../components/NewsCard';
import RewardBadge from '../components/RewardBadge';
import useNews from '../hooks/useNews';
import useRewards from '../hooks/useRewards';

const HomeScreen = () => {
  const { news } = useNews();
  const { points, badges } = useRewards();

  return (
    <View style={{ flex: 1 }}>
      <CategoryBar />
      <ScrollView>
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} />}
        />
      </ScrollView>
      <RewardBadge points={points} badges={badges} />
    </View>
  );
};

export default HomeScreen;