import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import NativeAdCard from './NativeAdCard'; // Adjust the import path as needed
import { NativeAd, NativeMediaAspectRatio, NativeAdChoicesPlacement } from 'react-native-google-mobile-ads';
const AD_UNIT_IDS = [
  "ca-app-pub-3382805190620235/3239205147", // First ad unit
  "ca-app-pub-3382805190620235/4943733703", // Second ad unit
  "ca-app-pub-3382805190620235/3630652032", // Third ad unit
];
const LoadingScreen = ({ quote }) => {
  const [nativeAd, setNativeAd] = useState(null);
  const [adLoading, setAdLoading] = useState(true); // Track ad loading state
  // Array of motivational quotes
  const quotes = [
    'The only thing we have to fear is fear itself. – Franklin D. Roosevelt',
    'To be, or not to be, that is the question. – William Shakespeare',
    'The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt',
    'That which does not kill us makes us stronger. – Friedrich Nietzsche',
    'Knowledge is power. – Francis Bacon',
    'A journey of a thousand miles begins with a single step. – Lao Tzu',
    'The greatest glory in living lies not in never falling, but in rising every time we fall. – Nelson Mandela',
    'It is better to have loved and lost than never to have loved at all. – Alfred Tennyson',
    'Ask not what your country can do for you, ask what you can do for your country. – John F. Kennedy',
    'A small leak will sink a great ship. – Benjamin Franklin',
    'It is better to light a single candle than to curse the darkness. – Confucius',
    'You miss 100% of the shots you don’t take. – Wayne Gretzky',
    'Curiosity killed the cat, but satisfaction brought it back. – Eugene O’Neill',
    'The pen is mightier than the sword. – Edward Bulwer-Lytton',
    'Life is what happens when you’re busy making other plans. – John Lennon',
    'Our greatest glory is not in never falling, but in rising every time we fall. – Nelson Mandela',
    'The difference between ordinary and extraordinary is that little extra. – Jimmy Johnson',
    'Don’t judge each day by the harvest you reap, but by the seeds that you plant. – Robert Louis Stevenson',
    'The best and most beautiful things in the world cannot be seen or even touched – they must be felt with the heart. – Helen Keller',
    'Believe you can and you’re halfway there. – Theodore Roosevelt',
    'You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. – Dr. Seuss',
    'Keep smiling, because life is a beautiful thing and there’s so much to smile about. – Marilyn Monroe',
    'In the depth of winter, I finally learned that within me there lay an invincible summer. – Albert Camus',
    'In three words, I can sum up everything I’ve learned about life: it goes on. – Robert Frost',
    'So we beat on, boats against the current, borne back ceaselessly into the past. – F. Scott Fitzgerald',
    'Life is either a daring adventure or nothing. – Helen Keller',
    'Hold fast to dreams, for if dreams die, life is like a bird with broken wings that cannot fly. – Langston Hughes',
    'You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face. You must do the thing you think you cannot do. – Eleanor Roosevelt',
    'Twenty years from now you will be more disappointed by the things that you didn’t do than by the ones you did do. So throw off the bowlines, sail away from safe harbor, catch the trade winds in your sails. Explore, Dream, Discover. – Mark Twain',
    'You don’t have to be great to start, but you have to start to be great. – Zig Ziglar',
    'The best way to predict your future is to create it. – Abraham Lincoln',
    'The only person you are destined to become is the person you decide to be. – Ralph Waldo Emerson',
    'It is during our darkest moments that we must focus to see the light. – Aristotle',
    'You are never too old to set another goal or to dream a new dream. – C.S. Lewis',
    'The only way to do great work is to love what you do. – Steve Jobs',
    'Don’t let what you cannot do interfere with what you can do. – John Wooden',
    'It’s not what happens to you, but how you react to it that matters. – Epictetus',
    'The purpose of our lives is to be happy. – Dalai Lama',
    'Let us never forget that medicine is for people. It is not for profit, it is not for status, it is not for self. – Albert Schweitzer',
    'The Wright brothers didn’t have a wind tunnel to test their flying machines. They built a kite and got to work. – Sheryl Sandberg',
    'Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that. – Martin Luther King Jr.',
    'The only person you are destined to become is the person you decide to be. – Ralph Waldo Emerson',
  ];

  // Randomly select a quote if none provided
  const displayQuote = quote || quotes[Math.floor(Math.random() * quotes.length)];

  // Animation values
  const dotScale1 = useSharedValue(1);
  const dotScale2 = useSharedValue(1);
  const dotScale3 = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const adOpacity = useSharedValue(0);

  useEffect(() => {
    // Load native ads
    const loadAds = async () => {
      setAdLoading(true);
      for (const adUnitId of AD_UNIT_IDS) {
        try {
          const ad = await NativeAd.createForAdRequest(adUnitId, {
            aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
            adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
            startVideoMuted: true,
          });
          setNativeAd(ad); // Set the first successful ad
          adOpacity.value = withTiming(1, { duration: 1000 });
          break; // Exit loop once we have a successful ad
        } catch (error) {
          console.error(`Failed to load ad from ${adUnitId}:`, error);
        }
      }
      setAdLoading(false);
    };

    loadAds();

    // Animate dots
    dotScale1.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    setTimeout(() => {
      dotScale2.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 200);
    
    setTimeout(() => {
      dotScale3.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 400);
    
    textOpacity.value = withTiming(1, { duration: 1000 });

    // Cleanup
    return () => {
      if (nativeAd) {
        nativeAd.destroy();
      }
    };
  }, []); // Removed nativeAd from dependencies to prevent re-running on ad load

  const animatedDot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale1.value }]
  }));
  const animatedDot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale2.value }]
  }));
  const animatedDot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale3.value }]
  }));
  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value
  }));
  const animatedAdStyle = useAnimatedStyle(() => ({
    opacity: adOpacity.value
  }));

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, animatedDot1Style]} />
          <Animated.View style={[styles.dot, animatedDot2Style]} />
          <Animated.View style={[styles.dot, animatedDot3Style]} />
        </View>
        
        <Animated.Text style={[styles.loadingText, animatedTextStyle]}>
          Loading the latest news
        </Animated.Text>
        
        <Animated.Text style={[styles.quoteText, animatedTextStyle]}>
          "{displayQuote}"
        </Animated.Text>
      </View>

      <Animated.View style={[styles.adContainer, animatedAdStyle]}>
        {nativeAd ? (
          <NativeAdCard nativeAd={nativeAd} />
        ) : adLoading ? (
          <Text style={styles.adPlaceholder}>Loading Ad...</Text>
        ) : (
          <Text style={styles.adPlaceholder}>No Ad Available</Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2575fc',
    margin: 5,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    fontWeight: '600',
  },
  quoteText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: '80%',
    lineHeight: 24,
  },
  adContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  adPlaceholder: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoadingScreen;