import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  'National',
  'World',
  'National MCQs',
  'World MCQs',
  'WeeklyCurrentAffairs',
  'Bookmarks',
];

// Define category colors to match the home screen
const CATEGORY_COLORS = {
  'National': '#5D5DFB',
  'World': '#4CAF50',
  'National MCQs': '#9C27B0',
  'World MCQs': '#FF5722',
  'WeeklyCurrentAffairs': '#2196F3',
  'Bookmarks': '#E91E63',
};

const CategoryBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const categoryPositions = useRef({}).current;
  
  // Always initialize with the current route name
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const currentRouteName = route.name;
    return CATEGORIES.includes(currentRouteName) ? currentRouteName : 'National';
  });
  
  // Sync selected category with current route
  useEffect(() => {
    const currentRouteName = route.name;
    if (CATEGORIES.includes(currentRouteName)) {
      setSelectedCategory(currentRouteName);
      
      // Scroll to make the selected category visible
      scrollToCategory(currentRouteName);
    }
  }, [route.name]);

  const scrollToCategory = (category) => {
    if (scrollViewRef.current && categoryPositions[category]) {
      scrollViewRef.current.scrollTo({
        x: Math.max(0, categoryPositions[category] - width / 4),
        animated: true
      });
    }
  };

  // Handle navigation and category selection
  const handleCategoryPress = useCallback(
    (category) => {
      if (CATEGORIES.includes(category)) {
        setSelectedCategory(category);
        navigation.navigate(category);
      }
    },
    [navigation],
  );

  // Measure and store category position when mounted
  const measurePosition = (category, event) => {
    const { x } = event.nativeEvent.layout;
    categoryPositions[category] = x;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1E1E1E']}
        style={styles.backgroundGradient}
      />
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          const categoryColor = CATEGORY_COLORS[category] || '#FF5722';
          
          return (
            <TouchableOpacity
              key={category}
              activeOpacity={0.7}
              onLayout={(e) => measurePosition(category, e)}
              onPress={() => handleCategoryPress(category)}>
              <View
                style={[
                  styles.categoryButton,
                  isSelected && {
                    borderBottomColor: categoryColor,
                    borderBottomWidth: 3,
                  }
                ]}>
                <Text 
                  style={[
                    styles.categoryText,
                    isSelected && { color: categoryColor, fontWeight: '700' }
                  ]}>
                  {category}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Add a subtle shadow at the edges to indicate scrollability */}
      <LinearGradient
        colors={['rgba(18,18,18,0.9)', 'rgba(18,18,18,0)']}
        start={{x: 0, y: 0.5}}
        end={{x: 0.05, y: 0.5}}
        style={styles.leftShadow}
      />
      <LinearGradient
        colors={['rgba(18,18,18,0)', 'rgba(18,18,18,0.9)']}
        start={{x: 0.95, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={styles.rightShadow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    paddingVertical: 5,
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff99',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Edge shadows to indicate scrollability
  leftShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 5,
  },
  rightShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 5,
  },
});

export default CategoryBar;