import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.42;

// AdMob configuration
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxx/zzzzzzzzzzzzzz';

const categories = [
  {name: 'National', icon: 'flag', color: '#5D5DFB'},
  {name: 'World', icon: 'earth', color: '#4CAF50'},
  {name: 'National MCQs', icon: 'lightbulb-on', color: '#9C27B0'},
  {name: 'World MCQs', icon: 'head-check-outline', color: '#FF5722'},
  {name: 'WeeklyCurrentAffairs', icon: 'laptop', color: '#2196F3'},
  {name: 'Bookmarks', icon: 'bookmark', color: '#E91E63'},
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const animatedValues = useRef(
    categories.map(() => new Animated.Value(0)),
  ).current;
  const bannerRef = useRef(null);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  
  // Create interstitial ad ref
  const interstitialRef = useRef(
    InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['current affairs', 'news', 'education'],
    })
  ).current;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

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
        // Reload the interstitial after it's closed
        setInterstitialLoaded(false);
        interstitialRef.load();
      }
    );

    // Start loading the interstitial
    interstitialRef.load();

    // Clean up event listeners
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  // Animation for initial load
  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const handleCategoryPress = (screenName) => {
    if (interstitialLoaded) {
      // Show the interstitial ad before navigating
      interstitialRef.show();
      
      // Add a listener for when the ad is closed
      const unsubscribeClosed = interstitialRef.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          // Navigate after the ad is closed
          navigation.navigate(screenName);
          unsubscribeClosed(); // Remove this listener
        }
      );
    } else {
      // If no ad is loaded, just navigate
      navigation.navigate(screenName);
    }
  };

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      <View style={styles.container}>
        <LinearGradient
          colors={['#121212', '#1E1E1E']}
          style={styles.gradient}
        />

        {/* Accent circles for futuristic feel */}
        <View style={styles.accentCircle1} />
        <View style={styles.accentCircle2} />

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {transform: [{translateY: headerTranslateY}]},
          ]}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}>
            <Animated.Text
              style={[styles.headerTitle, {opacity: titleOpacity}]}>
              Editorial
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, {opacity: titleOpacity}]}>
              Select an area to explore
            </Animated.Text>
          </LinearGradient>
        </Animated.View>

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
              outputRange: [1, 1.05],
            });

            const rotate = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '5deg'],
            });

            return (
              <TouchableOpacity
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                onPress={() => handleCategoryPress(item.name)}
                activeOpacity={0.8}>
                <Animated.View
                  style={[
                    styles.categoryButton,
                    {
                      transform: [{scale}, {rotate}],
                    },
                  ]}>
                  <LinearGradient
                    colors={[`${item.color}99`, item.color]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.cardGradient}>
                    <View style={styles.iconContainer}>
                      <Icon name={item.icon} size={32} color="#fff" />
                    </View>
                    <Text style={styles.categoryText}>{item.name}</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
        <View style={styles.bannerContainer}>
          <BannerAd
            ref={bannerRef}
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              networkExtras: {
                collapsible: 'bottom',
              },
            }}
            onAdFailedToLoad={error =>
              console.error('Ad failed to load: ', error)
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  accentCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFFFFF10',
    top: -150,
    right: -100,
  },
  accentCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#C6C0BE10',
    bottom: -50,
    left: -50,
  },
  header: {
    height: 180,
    justifyContent: 'flex-end',
  },
  headerGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '400',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryContainer: {
    padding: 20,
    paddingTop: 10,
  },
  categoryButton: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 0.8,
    borderRadius: 16,
    marginBottom: 5,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;
