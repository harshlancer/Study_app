import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

const SplashScreen = ({navigation}) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const circleScale1 = useRef(new Animated.Value(0.3)).current;
  const circleScale2 = useRef(new Animated.Value(0.3)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate all elements
    Animated.sequence([
      // First animate the logo and circles
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale1, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale2, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),

      // Then animate the text and icon
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotation, {
          toValue: 2,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),

      // Hold for a moment
      Animated.delay(1200),

      // Fade everything out
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Navigate to the main app
      navigation.replace('Home');
    });
  }, [navigation]);

  // Create an interpolation for the icon rotation
  const spin = iconRotation.interpolate({
    inputRange: [0, 2],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      <LinearGradient colors={['#121212', '#1E1E1E']} style={styles.gradient} />

      {/* Accent circles - matching the HomeScreen style */}
      <Animated.View
        style={[
          styles.accentCircle1,
          {
            transform: [{scale: circleScale1}],
            opacity: logoOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.accentCircle2,
          {
            transform: [{scale: circleScale2}],
            opacity: logoOpacity,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{scale: logoScale}],
          },
        ]}>
        <LinearGradient
          colors={['#5D5DFB', '#5D5DFB99']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.logoGradient}>
          <Animated.View style={{transform: [{rotate: spin}]}}>
            <Icon name="pencil" size={50} color="#FFF" />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.textContainer}>
        <Animated.Text style={[styles.title, {opacity: textOpacity}]}>
          Editor's Choice
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, {opacity: textOpacity}]}>
          Explore and Discover
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
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
    backgroundColor: '#5D5DFB10',
    top: -150,
    right: -100,
  },
  accentCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF572210',
    bottom: -50,
    left: -50,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5D5DFB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 16,
    fontWeight: '400',
  },
});

export default SplashScreen;
