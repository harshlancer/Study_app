import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  NativeAdView,
  NativeAsset,
  NativeMediaView,
  NativeMediaAspectRatio,
  NativeAssetType,
} from 'react-native-google-mobile-ads';

const NativeAdCard = ({ nativeAd }) => {
  if (!nativeAd) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1E1E', '#121212']}
        style={styles.gradientBackground}
      />
      <NativeAdView nativeAd={nativeAd} style={styles.adContainer}>
        {/* Header with icon and headline */}
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

        {/* Media content */}
        <NativeMediaView
          style={styles.media}
          resizeMode="cover"
          aspectRatio={NativeMediaAspectRatio.LANDSCAPE}
        />

        {/* Body with advertiser and body text */}
        <View style={styles.body}>
          {nativeAd.advertiser && (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text style={styles.advertiser}>{nativeAd.advertiser}</Text>
            </NativeAsset>
          )}
          {nativeAd.body && (
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={styles.bodyText} numberOfLines={3}>
                {nativeAd.body}
              </Text>
            </NativeAsset>
          )}
        </View>

        {/* Call to action button */}
        {nativeAd.callToAction && (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <TouchableOpacity style={styles.ctaButton}>
              <LinearGradient
                colors={['#5D5DFB', '#5D5DFB99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}>
                <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </NativeAsset>
        )}
      </NativeAdView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  adContainer: {
    padding: 12,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#ffffff20',
  },
  icon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  media: {
    width: '100%',
    height: 120, // Reduced height for splash screen
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#ffffff10',
  },
  body: {
    marginBottom: 10,
  },
  advertiser: {
    fontSize: 14,
    color: '#ffffffcc',
    fontWeight: '500',
    marginBottom: 5,
  },
  bodyText: {
    fontSize: 14,
    color: '#ffffff99',
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  ctaGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  ctaText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});

export default NativeAdCard;