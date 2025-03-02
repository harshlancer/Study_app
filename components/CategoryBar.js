import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Animated,
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
  const [selectedCategory, setSelectedCategory] = useState('National');
  const scrollViewRef = useRef(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const categoryPositions = useRef({}).current;
  
  // Sync selected category with current route
  useEffect(() => {
    const currentRouteName = route.name;
    if (CATEGORIES.includes(currentRouteName)) {
      setSelectedCategory(currentRouteName);
      
      // Animate the indicator to the new position
      if (categoryPositions[currentRouteName]) {
        Animated.spring(indicatorAnim, {
          toValue: categoryPositions[currentRouteName],
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
      
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
    (category, position) => {
      if (CATEGORIES.includes(category)) {
        setSelectedCategory(category);
        navigation.navigate(category);
        
        // Store the position for the indicator animation
        categoryPositions[category] = position;
        
        // Animate the indicator
        Animated.spring(indicatorAnim, {
          toValue: position,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    },
    [navigation],
  );

  // Measure and store category position when mounted
  const measurePosition = (category, event) => {
    const { x } = event.nativeEvent.layout;
    categoryPositions[category] = x;
    
    // Initialize the indicator position
    if (category === selectedCategory) {
      indicatorAnim.setValue(x);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1E1E1E']}
        style={styles.backgroundGradient}
      />
      
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: CATEGORY_COLORS[selectedCategory] || '#FF5722',
            transform: [{ translateX: indicatorAnim }]
          }
        ]}
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
              onPress={() => handleCategoryPress(category, categoryPositions[category])}>
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
  // Animated indicator - small dot that moves under the selected category
  indicator: {
    position: 'absolute',
    bottom: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 20,
  },
  // Edge shadows to indicate scrollability
  leftShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
  },
  rightShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
  },
});

export default CategoryBar;