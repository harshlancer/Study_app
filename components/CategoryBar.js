import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CATEGORY_WIDTH = width * 0.32;

const CATEGORY_COLORS = {
  National: '#5D5DFB',
  World: '#4CAF50',
  'National MCQs': '#9C27B0',
  'World MCQs': '#FF5722',
  WeeklyCurrentAffairs: '#2196F3',
  Bookmarks: '#E91E63',
};

const CategoryBar = ({ state, navigation }) => {
  const scrollViewRef = useRef(null);
  const categoryPositions = useRef({}).current;

  // Get categories and selected category from tab navigator state
  const categories = state.routes.map((route) => route.name);
  const selectedIndex = state.index;
  const selectedCategory = categories[selectedIndex];

  // Scroll to the selected category when the index changes
  useEffect(() => {
    scrollToCategory(selectedCategory);
  }, [selectedIndex]);

  const scrollToCategory = (category) => {
    if (!scrollViewRef.current || !categoryPositions[category]) return;

    const index = categories.indexOf(category);
    let scrollPosition = 0;

    if (index >= categories.length - 3) {
      scrollPosition = (categories.length - 3) * CATEGORY_WIDTH;
    } else {
      scrollPosition = Math.max(0, index * CATEGORY_WIDTH - width * 0.1);
    }

    scrollViewRef.current.scrollTo({
      x: scrollPosition,
      animated: true,
    });
  };

  const measurePosition = (category, event) => {
    const { x } = event.nativeEvent.layout;
    categoryPositions[category] = x;
  };

  const handleCategoryPress = (category) => {
    if (category !== selectedCategory) {
      navigation.navigate(category);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1E1E1E']}
        style={styles.backgroundGradient}
      />
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          const categoryColor = CATEGORY_COLORS[category] || '#FF5722';

          return (
            <TouchableOpacity
              key={category}
              activeOpacity={0.7}
              onLayout={(e) => measurePosition(category, e)}
              onPress={() => handleCategoryPress(category)}
              style={styles.categoryButton}
            >
              <View style={styles.categoryInner}>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected
                      ? { color: categoryColor, fontWeight: '700' }
                      : { color: '#ffffff99' },
                  ]}
                  numberOfLines={1}
                >
                  {category}
                </Text>
                {isSelected && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: categoryColor },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    paddingVertical: 5,
    overflow: 'hidden',
    backgroundColor: '#121212',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  categoryButton: {
    width: CATEGORY_WIDTH,
    paddingHorizontal: 8,
    height: '100%',
    justifyContent: 'center',
  },
  categoryInner: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    borderRadius: 2,
  },
});

export default CategoryBar;