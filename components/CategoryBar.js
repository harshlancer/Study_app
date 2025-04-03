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
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

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

  // State for selected category and navigation counter
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const currentRouteName = route.name;
    return CATEGORIES.includes(currentRouteName) ? currentRouteName : 'National';
  });
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [navigationCount, setNavigationCount] = useState(0); // Track navigation attempts

  // Create interstitial ad ref with Families compliance
  const interstitialRef = useRef(
    InterstitialAd.createForAdRequest('ca-app-pub-3382805190620235/5559102956', {
      requestNonPersonalizedAdsOnly: true,
      tagForChildDirectedTreatment: true, // Ensure family-friendly ads
      maxAdContentRating: 'G', // Restrict to General Audiences
      keywords: ['current affairs', 'news', 'education'],
    })
  ).current;

  // Load interstitial ad when component mounts
  useEffect(() => {
    const unsubscribeLoaded = interstitialRef.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setInterstitialLoaded(true);
      }
    );

    const unsubscribeClosed = interstitialRef.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setInterstitialLoaded(false);
        interstitialRef.load(); // Reload after closing
      }
    );

    interstitialRef.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  // Sync selected category with current route
  useEffect(() => {
    const currentRouteName = route.name;
    if (CATEGORIES.includes(currentRouteName)) {
      setSelectedCategory(currentRouteName);
      scrollToCategory(currentRouteName);
    }
  }, [route.name]);

  const scrollToCategory = (category) => {
    if (scrollViewRef.current && categoryPositions[category]) {
      scrollViewRef.current.scrollTo({
        x: Math.max(0, categoryPositions[category] - width / 4),
        animated: true,
      });
    }
  };

  // Handle navigation with ad logic (show ad every 3rd navigation)
  const handleCategoryPress = useCallback(
    (category) => {
      if (!CATEGORIES.includes(category) || category === selectedCategory) return; // Prevent re-navigation to same category

      setSelectedCategory(category);
      setNavigationCount((prevCount) => prevCount + 1); // Increment navigation counter

      const shouldShowAd = (navigationCount + 1) % 3 === 0; // Show ad every 3rd navigation

      if (interstitialLoaded && shouldShowAd) {
        interstitialRef.show();
        const unsubscribeClosed = interstitialRef.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            navigation.replace(category);
            unsubscribeClosed();
          }
        );
      } else {
        navigation.replace(category); // Navigate immediately if no ad
      }
    },
    [navigation, interstitialLoaded, navigationCount, selectedCategory]
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
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && { color: categoryColor, fontWeight: '700' },
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
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.05, y: 0.5 }}
        style={styles.leftShadow}
      />
      <LinearGradient
        colors={['rgba(18,18,18,0)', 'rgba(18,18,18,0.9)']}
        start={{ x: 0.95, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
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