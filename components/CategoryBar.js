import React, {useState, useCallback, useEffect} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';

const CATEGORIES = [
  'National',
  'World',
  'National MCQs',
  'World MCQs',
  'Tech',
  'Bookmarks',
];

const CategoryBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedCategory, setSelectedCategory] = useState('National');

  // Sync selected category with current route
  useEffect(() => {
    const currentRouteName = route.name;
    if (CATEGORIES.includes(currentRouteName)) {
      setSelectedCategory(currentRouteName);
    }
  }, [route.name]);

  // Handle navigation and category selection
  const handleCategoryPress = useCallback(
    category => {
      if (CATEGORIES.includes(category)) {
        setSelectedCategory(category);
        navigation.navigate(category);
      }
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {CATEGORIES.map(category => {
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(category)}>
              <LinearGradient
                colors={
                  isSelected ? ['#FF5722', '#fa9c57'] : ['#1a1a1a', '#2d2d2d']
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[
                  styles.categoryButton,
                  isSelected && styles.selectedCategory,
                ]}>
                <Text style={styles.categoryText}>{category}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60, // Restrict height
    backgroundColor: '#121212', // Dark background
    justifyContent: 'center',
    paddingVertical: 5,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25, // Rounded corners
    marginHorizontal: 6,
    elevation: 5, // Android shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
});

export default CategoryBar;
