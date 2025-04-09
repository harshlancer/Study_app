import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Vibration 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  NativeAdView,
  NativeAsset,
  NativeMediaView,
  NativeMediaAspectRatio,
  NativeAssetType,
} from 'react-native-google-mobile-ads';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NativeAdCard = ({ nativeAd, onClose }) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimeout = useRef(null);
  
  // Animation values
  const pressAnimation = useSharedValue(0);

  if (!nativeAd) return null;

  const handlePressIn = () => {
    pressAnimation.value = withTiming(1, { duration: 200 });

    // Start long press detection
    longPressTimeout.current = setTimeout(() => {
      setIsLongPressing(true);
      Vibration.vibrate(50); // Short vibration for feedback
    }, 800); // Trigger after 800ms hold
  };

  const handlePressOut = () => {
    pressAnimation.value = withTiming(0, { duration: 200 });

    // Clear long press timeout
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    setIsLongPressing(false);
  };

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

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={800}>
      <Animated.View style={[styles.container, animatedCardStyle]}>
        <LinearGradient
          colors={['#1E1E1E', '#292929']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />
        <NativeAdView nativeAd={nativeAd} style={styles.adContainer}>
          {/* Header with close button, icon and headline */}
          <View style={styles.headerRow}>
            <View style={styles.header}>
              {nativeAd.icon && (
                <NativeAsset assetType={NativeAssetType.ICON} style={styles.iconContainer}>
                  <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
                </NativeAsset>
              )}
              <View style={styles.headerText}>
                <NativeAsset assetType={NativeAssetType.HEADLINE}>
                  <Text style={styles.headline} numberOfLines={2}>
                    {nativeAd.headline}
                  </Text>
                </NativeAsset>
                <Text style={styles.sponsored}>Sponsored</Text>
              </View>
            </View>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close-circle" size={22} color="#BDBDBD" />
              </TouchableOpacity>
            )}
          </View>

          {/* Media content */}
          <View style={styles.mediaContainer}>
            <NativeMediaView
              style={styles.media}
              resizeMode="cover"
              aspectRatio={NativeMediaAspectRatio.LANDSCAPE}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}>
              {nativeAd.advertiser && (
                <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                  <Text style={styles.advertiserLabel}>{nativeAd.advertiser}</Text>
                </NativeAsset>
              )}
            </LinearGradient>
          </View>

          {/* Body with body text */}
          <View style={styles.body}>
            {nativeAd.body && (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.bodyText} numberOfLines={3}>
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            )}
          </View>

          {/* Footer with call to action */}
          <View style={styles.footer}>
            {nativeAd.callToAction && (
              <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                <TouchableOpacity style={styles.ctaButton}>
                  <LinearGradient
                    colors={['#5D5DFB', '#4D4DE6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGradient}>
                    <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </NativeAsset>
            )}
            {/* Placeholder to balance the layout like in NewsCard */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="information-outline" size={22} color="#BDBDBD" />
              </TouchableOpacity>
            </View>
          </View>
        </NativeAdView>
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
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
  },
  adContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#ffffff20',
  },
  icon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeButton: {
    padding: 4,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  sponsored: {
    fontSize: 12,
    color: '#ffffff80',
    marginTop: 2,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff10',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  advertiserLabel: {
    color: '#fff',
    backgroundColor: 'rgba(93, 93, 251, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  body: {
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: '#BDBDBD',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ctaButton: {
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  ctaGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  ctaText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
});

export default NativeAdCard;