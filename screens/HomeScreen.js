import React, {useRef} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const categories = [
  {name: 'National', icon: 'flag', color: '#5D5DFB'},
  {name: 'World', icon: 'earth', color: '#4CAF50'},
  {name: 'National MCQs', icon: 'briefcase', color: '#9C27B0'},
  {name: 'World MCQs', icon: 'soccer', color: '#FF5722'},
  {name: 'Tech', icon: 'laptop', color: '#2196F3'},
  {name: 'Bookmarks', icon: 'bookmark', color: '#E91E63'},
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const animatedValues = useRef(
    categories.map(() => new Animated.Value(0)),
  ).current;

  const handlePressIn = index => {
    Animated.spring(animatedValues[index], {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = index => {
    Animated.spring(animatedValues[index], {
      toValue: 0,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <StatusBar backgroundColor="#FF5722" barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF5722', '#fa9c57']}
          style={styles.welcomeBox}>
          <Text style={styles.welcomeMessage}>
            Hello welcome to the app {'\n'}
            what would you like to study?
          </Text>
        </LinearGradient>
      </View>

      {/* Category Grid */}
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={item => item.name}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.categoryContainer}
        renderItem={({item, index}) => {
          const scale = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          });

          return (
            <TouchableOpacity
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.8}>
              <Animated.View
                style={[
                  styles.categoryButton,
                  {
                    transform: [{scale}],
                    backgroundColor: item.color,
                  },
                ]}>
                <Icon name={item.icon} size={32} color="#fff" />
                <Text style={styles.categoryText}>{item.name}</Text>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
      />
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 30,
  },
  welcomeBox: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

    padding: 20,
    height: 120,
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  welcomeMessage: {
    color: '#FFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  categoryButton: {
    width: 110,
    height: 110,
    borderRadius: 80,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  categoryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
