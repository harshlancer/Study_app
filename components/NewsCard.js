import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Share,
  Platform,
  Animated as RNAnimated,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {WebView} from 'react-native-webview';

const {width} = Dimensions.get('window');

const NewsCard = ({
  news,
  navigation,
  onBookmark,
  isBookmarked: isInitiallyBookmarked,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(
    isInitiallyBookmarked || false,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimeout = useRef(null);

  // Animation values
  const expandProgress = useSharedValue(0);
  const pressAnimation = useSharedValue(0);
  const shareScaleAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    setIsBookmarked(isInitiallyBookmarked || false);
  }, [isInitiallyBookmarked]);

  useEffect(() => {
    // Animate the expansion
    expandProgress.value = withTiming(isExpanded ? 1 : 0, {duration: 400});

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

  useEffect(() => {
    // Clean up timeout on unmount
    return () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, []);

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        expandProgress.value,
        [0, 1],
        [0, 300],
        Extrapolate.CLAMP,
      ),
      opacity: expandProgress.value,
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            pressAnimation.value,
            [0, 1],
            [1, 1.02],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  });

  const handleBookmark = e => {
    e.stopPropagation(); // Prevent triggering card press
    setIsBookmarked(!isBookmarked);
    onBookmark(news, !isBookmarked);
  };

  const toggleExpansion = e => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    setIsExpanded(!isExpanded);
  };
  const handlePressIn = () => {
    // Only allow long press if not expanded
    if (!isExpanded) {
      pressAnimation.value = withTiming(1, {duration: 200});

      // Start long press detection
      longPressTimeout.current = setTimeout(() => {
        setIsLongPressing(true);
        Vibration.vibrate(50); // Short vibration for feedback

        // Animate scale up for share visual feedback
        RNAnimated.sequence([
          RNAnimated.timing(shareScaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          RNAnimated.timing(shareScaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        // Share on long press
        handleShare();
      }, 800); // Trigger after 800ms hold
    }
  };


  const handlePressOut = () => {
    // Only reset animation if not expanded
    if (!isExpanded) {
      pressAnimation.value = withTiming(0, {duration: 200});

      // Clear long press timeout
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }

      setIsLongPressing(false);
    }
  };

  // Modified handleShare function to directly use the news.imageUrl instead of capturing
  const handleShare = async () => {
    try {
      // Prepare share options with platform-specific handling
      const shareOptions = {
        title: 'Share News Article',
        message: `Check out this article: ${news.title}\n${news.summary}\nSource: ${news.source}`,
      };
      
      // Add the URL to the article
      if (news.url) {
        shareOptions.message += `\n\nRead more: ${news.url}`;
      }
      
      // Add the image URL to share options based on platform
      if (news.imageUrl && news.imageUrl !== 'https://via.placeholder.com/600x300') {
        if (Platform.OS === 'ios') {
          shareOptions.url = news.imageUrl;
        } else {
          // For Android
          shareOptions.url = news.imageUrl;
        }
      }
      
      // Trigger the share dialog
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('Share was successful');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Dedicated share button handler - now uses the same logic as handleShare
  const handleShareButton = async e => {
    if (e) e.stopPropagation();
    handleShare();
  };

  // Handle WebView scroll to prevent collapsing
  const handleWebViewScroll = event => {
    // Prevent the parent scroll view from capturing the events
    event.stopPropagation();
  };

  // WebView JavaScript for scrollable content
  const injectedJavaScript = `
    document.body.style.backgroundColor = '#1E1E1E';
    document.body.style.color = '#FFFFFF';
    
    // This helps with scroll behavior
    document.documentElement.style.overflowY = 'scroll';
    document.documentElement.style.webkitOverflowScrolling = 'touch';
    
    // Make links open in new window
    Array.from(document.getElementsByTagName('a')).forEach(link => {
      link.setAttribute('target', '_blank');
    });
    
    // Prevent touch events from propagating to parent
    document.addEventListener('touchmove', function(e) {
      e.stopPropagation();
    }, true);
    
    // Post height for proper scrolling
    window.ReactNativeWebView.postMessage(
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    );
    true;
  `;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={() => {}} // Empty function to allow longPress detection
      delayLongPress={800}>
      <Animated.View style={[styles.container, animatedCardStyle]}>
        <LinearGradient
          colors={['#1E1E1E', '#292929']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.card}>
          <Image
            source={{uri: news.imageUrl}}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}>
            <View style={styles.sourceContainer}>
              <Text style={styles.source}>{news.source}</Text>
              <Text style={styles.time}>{news.time}</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text
              style={styles.title}
              numberOfLines={isExpanded ? undefined : 2}>
              {news.title}
            </Text>
            <Text
              style={styles.summary}
              numberOfLines={isExpanded ? undefined : 3}>
              {news.summary}
            </Text>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={toggleExpansion}
                style={styles.readMoreButton}>
                <Text style={styles.readMore}>
                  {isExpanded ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={handleShareButton}
                  style={styles.actionButton}>
                  <Icon name="share-variant" size={22} color="#BDBDBD" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleBookmark}
                  style={styles.actionButton}>
                  <Icon
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={22}
                    color={isBookmarked ? '#5D5DFB' : '#BDBDBD'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Animated Expanded Content */}
            {isExpanded && (
              <Animated.View
                style={[
                  styles.expandedContentContainer,
                  animatedContentStyle,
                ]}>
                {webViewVisible && (
                  <>
                    <View style={styles.separator} />
                    <View style={styles.webViewContainer}>
                      <WebView
                        source={{uri: news.url}}
                        style={styles.webview}
                        startInLoadingState={true}
                        injectedJavaScript={injectedJavaScript}
                        renderLoading={() => (
                          <View style={styles.webviewLoading}>
                            <ActivityIndicator size="large" color="#5D5DFB" />
                          </View>
                        )}
                        onError={e => {
                          console.log('WebView error:', e);
                        }}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        containerStyle={styles.webViewInnerContainer}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                        domStorageEnabled={true}
                        javaScriptEnabled={true}
                        allowsInlineMediaPlayback={true}
                        onScroll={handleWebViewScroll}
                        onTouchStart={e => e.stopPropagation()}
                        onTouchMove={e => e.stopPropagation()}
                        onTouchEnd={e => e.stopPropagation()}
                      />
                    </View>
                  </>
                )}
              </Animated.View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
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
    backgroundColor: 'rgba(93, 93, 251, 0.7)',
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
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    color: '#BDBDBD',
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
    color: '#5D5DFB',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandedContentContainer: {
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 16,
  },
  webViewContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1E1E1E',
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
    backgroundColor: '#242424',
  },
});

export default NewsCard;