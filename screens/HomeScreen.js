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
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { fetchNationalNews } from '../services/newsService'; // Adjust the import path as necessary

import ProgressTracker from '../components/ProgressTracker';
const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.42;
const INTERSTITIAL_DELAY = 1 * 60 * 1000;
const NAVIGATION_THRESHOLD = 3;

// AdMob configuration
const bannerAdUnitId = 'ca-app-pub-3382805190620235/7614782049';
const interstitialAdUnitId = 'ca-app-pub-3382805190620235/5559102956';

const categories = [
  {name: 'National', icon: 'flag', color: '#5D5DFB'},
  {name: 'World', icon: 'earth', color: '#4CAF50'},
  {name: 'National MCQs', icon: 'lightbulb-on', color: '#9C27B0'},
  {name: 'World MCQs', icon: 'head-check-outline', color: '#FF5722'},
  {name: 'WeeklyCurrentAffairs', icon: 'laptop', color: '#2196F3'},
  {name: 'Bookmarks', icon: 'bookmark', color: '#E91E63'},
];



const LatestNewsPreview = ({navigation}) => {
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await fetchNationalNews();
        setLatestNews(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <View style={styles.newsPreviewContainer}>
        <Text style={styles.newsPreviewTitle}>Latest Updates</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading latest news...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.newsPreviewContainer}>
      <Text style={styles.newsPreviewTitle}>Latest Updates</Text>
      <FlatList
        data={latestNews}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.url}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.newsItem}
            onPress={() => navigation.navigate('National', {selectedNewsId: item.url})}>
            <LinearGradient
              colors={['#2c2c2c', '#3d3d3d']}
              style={styles.newsItemGradient}>
              <Text style={styles.newsItemCategory}>{item.category}</Text>
              <Text style={styles.newsItemTitle}>{item.title}</Text>
              <Text style={styles.viewMoreText}>Read more</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
const HomeScreen = () => {
  const navigation = useNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [lastAdShown, setLastAdShown] = useState(0);
  const [navigationCount, setNavigationCount] = useState(0);
  const sidebarAnim = useRef(new Animated.Value(-250)).current;
  const animatedValues = useRef(
    categories.map(() => new Animated.Value(0)),
  ).current;
  const bannerRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const interstitialRef = useRef(
    InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
      tagForChildDirectedTreatment: true,
      maxAdContentRating: 'G',
      keywords: ['current affairs', 'news', 'education'],
    }),
  ).current;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: isSidebarOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  useEffect(() => {
    const unsubscribeLoaded = interstitialRef.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setInterstitialLoaded(true);
      },
    );

    const unsubscribeClosed = interstitialRef.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setInterstitialLoaded(false);
        setLastAdShown(Date.now());
        interstitialRef.load();
      },
    );

    interstitialRef.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

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

  const showInterstitialIfReady = callback => {
    const now = Date.now();
    const timeElapsed = now - lastAdShown >= INTERSTITIAL_DELAY;
    const shouldShowAd = navigationCount % NAVIGATION_THRESHOLD === 0;

    if (interstitialLoaded && timeElapsed && shouldShowAd) {
      interstitialRef.show();
      const unsubscribeClosed = interstitialRef.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          callback();
          unsubscribeClosed();
        },
      );
    } else {
      callback();
    }
  };

  const handleCategoryPress = screenName => {
    setNavigationCount(prevCount => prevCount + 1);
    showInterstitialIfReady(() => navigation.navigate(screenName));
  };

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, {transform: [{translateX: sidebarAnim}]}]}>
        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate('PrivacyPolicyScreen');
              setIsSidebarOpen(false);
            }}>
            <Icon
              name="shield-account"
              size={24}
              color="#FFF"
              style={styles.sidebarIcon}
            />
            <Text style={styles.sidebarText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate('AboutUsScreen');
              setIsSidebarOpen(false);
            }}>
            <Icon
              name="information-outline"
              size={24}
              color="#FFF"
              style={styles.sidebarIcon}
            />
            <Text style={styles.sidebarText}>About Us</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate('ContactUs');
              setIsSidebarOpen(false);
            }}>
            <Icon
              name="email-outline"
              size={24}
              color="#FFF"
              style={styles.sidebarIcon}
            />
            <Text style={styles.sidebarText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Backdrop */}
      {isSidebarOpen && (
        <TouchableWithoutFeedback onPress={toggleSidebar}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.container}>
        <LinearGradient
          colors={['#121212', '#1E1E1E']}
          style={styles.gradient}
        />

        {/* Accent circles */}
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
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
              <Icon name="menu" size={28} color="#FFF" />
            </TouchableOpacity>
            <Animated.Text
              style={[styles.headerTitle, {opacity: titleOpacity}]}>
              Currently
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, {opacity: titleOpacity}]}>
              Select an area to explore
            </Animated.Text>
          </LinearGradient>
        </Animated.View>
        <ProgressTracker navigation={navigation} />

        {/* Category Grid */}
        <FlatList
          ListHeaderComponent={
            <>
              {/* Latest News Preview */}
              <LatestNewsPreview navigation={navigation} />

              {/* Section Title */}
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
            </>
          }
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
                    {transform: [{scale}, {rotate}]},
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
          ListFooterComponent={
            <View style={{height: 80}} /> // Space for the banner ad
          }
        />

        {/* Banner Ad */}
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
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#FFF',
    marginLeft: 5,
    fontWeight: '500',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFF',
    opacity: 0.8,
    marginRight: 3,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5D5DFB',
    borderRadius: 6,
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    position: 'absolute',
    right: 8,
    top: -16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 12,
    marginTop: 2,
  },


  sectionTitleContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#1E1E1E',
    zIndex: 100,
    elevation: 100,
  },
  sidebarContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  sidebarItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarIcon: {
    marginRight: 15,
  },
  sidebarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
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
  // New styles for LatestNewsPreview
  newsPreviewContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  newsPreviewTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  newsItem: {
    width: width * 0.8,
    height: 110,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsItemGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  newsItemCategory: {
    color: '#5D5DFB',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  newsItemTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  viewMoreText: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  loadingContainer: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    opacity: 0.7,
  },
});

export default HomeScreen;
