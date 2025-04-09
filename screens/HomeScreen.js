import React, { useRef, useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { fetchNationalNews } from '../services/newsService';
import {
  loadStats,
  subscribeToStats,
  defaultStats,
  updateStats,
} from '../services/statsTracker';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.44;
const INTERSTITIAL_DELAY = 1 * 60 * 1000; // 1 minute
const NAVIGATION_THRESHOLD = 3;

// AdMob configuration
const bannerAdUnitId = 'ca-app-pub-3382805190620235/7614782049';
const interstitialAdUnitId = 'ca-app-pub-3382805190620235/5559102956';

const categories = [
  { name: 'National', icon: 'flag', color: '#5D5DFB', gradient: ['#4A4AFA', '#7878FF'] },
  { name: 'World', icon: 'earth', color: '#4CAF50', gradient: ['#3D9140', '#62C866'] },
  { name: 'National MCQs', icon: 'lightbulb-on', color: '#9C27B0', gradient: ['#8219A0', '#B44DD0'] },
  { name: 'World MCQs', icon: 'head-check-outline', color: '#FF5722', gradient: ['#E8450F', '#FF7D4E'] },
  { name: 'WeeklyCurrentAffairs', icon: 'laptop', color: '#2196F3', gradient: ['#0E86E7', '#48ACFF'] },
  { name: 'Bookmarks', icon: 'bookmark', color: '#E91E63', gradient: ['#D10E54', '#F54A7E'] },
];

const levelBadges = {
  Beginner: { icon: 'seed', color: '#4CAF50' },
  Learner: { icon: 'leaf', color: '#8BC34A' },
  'Knowledge Seeker': { icon: 'flower', color: '#FFC107' },
  'Current Affairs Pro': { icon: 'tree', color: '#FF9800' },
  Master: { icon: 'star', color: '#F44336' },
};

const LatestNewsPreview = ({ navigation }) => {
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

  const handleNewsPress = async (screenName, newsId) => {
    // Optional: Uncomment to track articles read if desired
    // await updateStats('article', 1);
    navigation.navigate(screenName, { selectedNewsId: newsId });
  };

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
      <View style={styles.sectionHeader}>
        <Icon name="newspaper-variant-outline" size={20} color="#5D5DFB" />
        <Text style={styles.newsPreviewTitle}>Latest Updates</Text>
      </View>
      <FlatList
        data={latestNews}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.url}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.newsItem}
            onPress={() => handleNewsPress('National', item.url)}>
            <LinearGradient
              colors={['#2c2c2c', '#3d3d3d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newsItemGradient}>
              <Text style={styles.newsItemCategory}>{item.category}</Text>
              <Text style={styles.newsItemTitle}>{item.title}</Text>
              <View style={styles.newsFooter}>
                <Text style={styles.viewMoreText}>Read more</Text>
                <Icon name="arrow-right" size={14} color="#5D5DFB" />
              </View>
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
  const [userStats, setUserStats] = useState(defaultStats);
  const startTime = useRef(Date.now());

  // Animation refs
  const sidebarAnim = useRef(new Animated.Value(-250)).current;
  const animatedValues = useRef(categories.map(() => new Animated.Value(0))).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Ad refs
  const bannerRef = useRef(null);
  const interstitialRef = useRef(
    InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
      tagForChildDirectedTreatment: true,
      maxAdContentRating: 'G',
      keywords: ['current affairs', 'news', 'education'],
    })
  ).current;

  useEffect(() => {
    const loadInitialStats = async () => {
      const stats = await loadStats();
      setUserStats(stats);
    };
    loadInitialStats();

    const unsubscribeStats = subscribeToStats(newStats => {
      setUserStats(newStats);
    });

    // Track time spent every minute
    const interval = setInterval(() => {
      const timeSpentThisSession = Math.floor((Date.now() - startTime.current) / 1000);
      updateStats('time', timeSpentThisSession);
      startTime.current = Date.now();
    }, 60000);

    // Animation sequence
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    // Interstitial ad listeners
    const unsubscribeLoaded = interstitialRef.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
    });
    const unsubscribeClosed = interstitialRef.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      setLastAdShown(Date.now());
      interstitialRef.load();
    });
    interstitialRef.load();

    return () => {
      unsubscribeStats();
      clearInterval(interval);
      unsubscribeLoaded();
      unsubscribeClosed();
      const timeSpentThisSession = Math.floor((Date.now() - startTime.current) / 1000);
      updateStats('time', timeSpentThisSession);
    };
  }, []);

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: isSidebarOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
      const unsubscribeClosed = interstitialRef.addAdEventListener(AdEventType.CLOSED, () => {
        callback();
        unsubscribeClosed();
      });
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

  const badgePercentage = userStats?.unlockedBadges?.length > 0
    ? Math.min((userStats.unlockedBadges.length / 10) * 100, 100)
    : 0;

  const renderStreakIndicator = () => {
    return (
      <TouchableOpacity
        style={styles.streakIndicator}
        onPress={() => navigation.navigate('Achievements')}>
        <View style={styles.streakCircle}>
          <Text style={styles.streakNumber}>{userStats.streak || 0}</Text>
          <Text style={styles.streakDays}>days</Text>
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakTitle}>Daily Streak</Text>
          <View style={styles.miniProgressBar}>
            <View style={[styles.miniProgress, { width: `${badgePercentage}%` }]} />
          </View>
        </View>
        <Icon name="chevron-right" size={20} color="#FFF" style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarHeaderText}>Currently</Text>
          <Text style={styles.sidebarSubheader}>Stay informed, always</Text>
        </View>
        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate('Achievements');
              setIsSidebarOpen(false);
            }}>
            <Icon name="trophy-outline" size={24} color="#FFF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>My Achievements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate('PrivacyPolicyScreen');
              setIsSidebarOpen(false);
            }}>
            <Icon name="shield-account" size={24} color="#FFF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate('AboutUsScreen');
              setIsSidebarOpen(false);
            }}>
            <Icon name="information-outline" size={24} color="#FFF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate('ContactUs');
              setIsSidebarOpen(false);
            }}>
            <Icon name="email-outline" size={24} color="#FFF" style={styles.sidebarIcon} />
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
        <LinearGradient colors={['#121212', '#1E1E1E']} style={styles.gradient} />

        {/* Background accents */}
        <View style={styles.accentCircle1} />
        <View style={styles.accentCircle2} />
        <View style={styles.accentCircle3} />

        {/* Header */}
        <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}>
          <LinearGradient colors={['#12121280', '#1E1E1E']} style={styles.headerGradient}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
                <Icon name="menu" size={28} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Achievements')}>
                <Icon
                  name={levelBadges[userStats.level].icon}
                  size={28}
                  color={levelBadges[userStats.level].color}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.headerContent}>
              <Animated.Text style={[styles.headerTitle, { opacity: titleOpacity }]}>
                Currently
              </Animated.Text>
              <Animated.Text style={[styles.subtitle, { opacity: titleOpacity }]}>
                Stay updated with today's world
              </Animated.Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            ListHeaderComponent={
              <>
                {renderStreakIndicator()}
                <LatestNewsPreview navigation={navigation} />
                <View style={styles.sectionHeader}>
                  <Icon name="shape-outline" size={20} color="#5D5DFB" />
                  <Text style={styles.sectionTitle}>Categories</Text>
                </View>
              </>
            }
            data={categories}
            numColumns={2}
            keyExtractor={item => item.name}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.categoryContainer}
            renderItem={({ item, index }) => {
              const scale = animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
              });

              return (
                <TouchableOpacity
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  onPress={() => handleCategoryPress(item.name)}
                  activeOpacity={0.8}>
                  <Animated.View style={[styles.categoryButton, { transform: [{ scale }] }]}>
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
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
            ListFooterComponent={<View style={{ height: 80 }} />}
          />
        </Animated.View>

        {/* Banner Ad */}
        <View style={styles.bannerContainer}>
          <BannerAd
            ref={bannerRef}
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ networkExtras: { collapsible: 'bottom' } }}
            onAdFailedToLoad={error => console.error('Ad failed to load: ', error)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1 },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#1A1A1A',
    zIndex: 100,
    elevation: 100,
    borderRightWidth: 1,
    borderColor: '#333',
  },
  sidebarHeader: { paddingTop: 60, padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  sidebarHeaderText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  sidebarSubheader: { color: '#AAA', fontSize: 14, marginTop: 5 },
  sidebarContent: { paddingTop: 20, paddingHorizontal: 10 },
  sidebarItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarIcon: { marginRight: 15, width: 24 },
  sidebarText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 99,
  },
  header: { height: 160 },
  headerGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuButton: { padding: 5 },
  profileButton: { padding: 5 },
  headerContent: { marginTop: 20 },
  headerTitle: { color: '#FFF', fontSize: 32, fontWeight: '700', letterSpacing: 1 },
  subtitle: { color: '#AAA', fontSize: 16, marginTop: 5, fontWeight: '400' },
  streakIndicator: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderColor: '#5D5DFB',
  },
  streakCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5D5DFB20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  streakNumber: { color: '#5D5DFB', fontSize: 18, fontWeight: '700' },
  streakDays: { color: '#5D5DFB', fontSize: 10, fontWeight: '500' },
  streakInfo: { flex: 1 },
  streakTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 5 },
  miniProgressBar: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden', width: '100%' },
  miniProgress: { height: '100%', backgroundColor: '#5D5DFB' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, marginTop: 10 },
  newsPreviewContainer: { marginTop: 10, marginBottom: 15, paddingHorizontal: 20 },
  newsPreviewTitle: { color: '#FFF', fontSize: 18, fontWeight: '600', marginLeft: 10 },
  newsItem: {
    width: width * 0.75,
    height: 120,
    marginRight: 15,
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
  },
  newsItemGradient: { flex: 1, padding: 15, justifyContent: 'space-between' },
  newsItemCategory: { color: '#5D5DFB', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  newsItemTitle: { color: '#FFF', fontSize: 16, fontWeight: '500', lineHeight: 22 },
  newsFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' },
  viewMoreText: { color: '#5D5DFB', fontSize: 14, marginRight: 5 },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
  },
  loadingText: { color: '#FFF', opacity: 0.7 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '600', marginLeft: 10 },
  categoryContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 5 },
  categoryButton: { width: ITEM_WIDTH, height: ITEM_WIDTH * 0.85, borderRadius: 16, overflow: 'hidden', elevation: 5 },
  cardGradient: { flex: 1, padding: 16, justifyContent: 'space-between' },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: { color: '#FFF', fontWeight: '600', fontSize: 16, letterSpacing: 0.5 },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  accentCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#5D5DFB10',
    top: -100,
    right: -50,
  },
  accentCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4CAF5010',
    bottom: 100,
    left: -80,
  },
  accentCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FF572210',
    right: -50,
    bottom: 20,
  },
});

export default HomeScreen;