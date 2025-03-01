import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'react-native-linear-gradient';
import HTMLView from 'react-native-htmlview';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import HTMLParser from 'react-native-html-parser'; // Make sure this is installed

const { width } = Dimensions.get('window');

const NewsCard = ({ news, navigation, onBookmark, isBookmarked: isInitiallyBookmarked }) => {
  const [isBookmarked, setIsBookmarked] = useState(isInitiallyBookmarked || false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  
  // Animation values
  const expandProgress = useSharedValue(0);

  useEffect(() => {
    setIsBookmarked(isInitiallyBookmarked || false);
  }, [isInitiallyBookmarked]);

  useEffect(() => {
    // Animate the expansion
    expandProgress.value = withTiming(isExpanded ? 1 : 0, { duration: 400 });
    
    // Show WebView when expanded
    if (isExpanded) {
      setWebViewVisible(true);
    } else {
      // Add a slight delay before hiding WebView to allow animation to complete
      setTimeout(() => {
        setWebViewVisible(false);
      }, 400);
    }
  }, [isExpanded]);

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        expandProgress.value,
        [0, 1],
        [0, 300], // Fixed height of 300
        Extrapolate.CLAMP
      ),
      opacity: expandProgress.value,
    };
  });

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(news, !isBookmarked);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // This is the key to making the WebView scrollable within a fixed container
  const injectedJavaScript = `
    window.ReactNativeWebView.postMessage(
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    );
    true; // note: this is required, or you'll sometimes get silent failures
  `;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={{ uri: news.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.sourceContainer}>
            <Text style={styles.source}>{news.source}</Text>
            <Text style={styles.time}>{news.time}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={isExpanded ? undefined : 2}>
            {news.title}
          </Text>
          <Text style={styles.summary} numberOfLines={isExpanded ? undefined : 3}>
            {news.summary}
          </Text>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={toggleExpansion}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMore}>
                {isExpanded ? 'Read Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleBookmark}
              style={styles.bookmarkButton}
            >
              <Icon
                name={isBookmarked ? 'bookmark' : 'bookmark-o'}
                size={25}
                color={isBookmarked ? '#2575fc' : '#666'}
              />
            </TouchableOpacity>
          </View>

          {/* Animated Expanded Content with Fixed Height */}
          <Animated.View style={[styles.expandedContentContainer, animatedContentStyle]}>
            {webViewVisible && (
              <>
                <View style={styles.separator} />
                <View style={styles.webViewContainer}>
                  <WebView
                    source={{ uri: news.url }}
                    style={styles.webview}
                    startInLoadingState={true}
                    injectedJavaScript={injectedJavaScript}
                    renderLoading={() => (
                      <View style={styles.webviewLoading}>
                        <ActivityIndicator size="large" color="#2575fc" />
                      </View>
                    )}
                    onError={(e) => {
                      console.log('WebView error:', e);
                    }}
                    // This allows scrolling inside the WebView
                    scrollEnabled={true}
                    // These are important to ensure proper scrolling behavior
                    nestedScrollEnabled={true}
                    containerStyle={styles.webViewInnerContainer}
                  />
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  readMore: {
    color: '#2575fc',
    fontSize: 14,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 8,
  },
  expandedContentContainer: {
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  webViewContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  webViewInnerContainer: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
});

export default NewsCard;