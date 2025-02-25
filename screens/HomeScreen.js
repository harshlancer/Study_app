import React, { useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RewardBadge from '../components/RewardBadge';
import useNews from '../hooks/useNews';
import useRewards from '../hooks/useRewards';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const categories = [
  { name: 'National', icon: 'flag', color: '#5D5DFBFF' }, // Coral
  { name: 'World', icon: 'earth', color: '#5D5DFBFF' }, // Purple
  { name: 'Business', icon: 'briefcase', color: '#5D5DFBFF' }, // Green
  { name: 'Sports', icon: 'soccer', color: '#5D5DFBFF' }, // Orange
  { name: 'Tech', icon: 'laptop', color: '#5D5DFBFF' }, // Blue
  { name: 'Bookmarks', icon: 'bookmark', color: '#5D5DFBFF' }, // Pink
];

const HomeScreen = () => {
  const { news } = useNews();
  const { points, badges } = useRewards();
  const navigation = useNavigation();
  const animatedValues = useRef(categories.map(() => new Animated.Value(0))).current;

  const handlePressIn = (index) => {
    Animated.spring(animatedValues[index], {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(animatedValues[index], {
      toValue: 0,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ImageBackground
      source={require('./image.png')} // Your chosen background image
      style={styles.background}
      blurRadius={3} // Slight blur for better readability
    >
      <View style={styles.overlay}>
        {/* Category Grid */}
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(item) => item.name}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => {
            const scale = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1], // Slight jump effect
            });

            return (
              <TouchableOpacity
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                onPress={() => navigation.navigate(item.name)}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.categoryButton,
                    { transform: [{ scale }], backgroundColor: item.color },
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={30} color="#fff" />
                  </View>
                  <Text style={styles.categoryText}>{item.name}</Text>
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />

        {/* News List */}
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} />}
          contentContainerStyle={{ paddingTop: 10 }}
        />

        {/* Reward Badge */}
        <RewardBadge points={points} badges={badges} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'contain',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(208, 197, 203, 0.2)', // Dark overlay for contrast
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryButton: {
    flex: 1,
    margin: 5,
    padding: 20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconContainer: {
    width: 80,
    height: 50,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;