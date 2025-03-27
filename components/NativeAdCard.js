import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {
  NativeAdView,
  NativeAsset,
  NativeMediaView,
  NativeMediaAspectRatio,
  NativeAssetType // Added missing import
} from 'react-native-google-mobile-ads';

const NativeAdCard = ({ nativeAd }) => {
  if (!nativeAd) return null;

  return (
    <View style={styles.container}>
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
              <Text style={styles.headline} numberOfLines={2}>{nativeAd.headline}</Text>
            </NativeAsset>
            <Text style={styles.sponsored}>Sponsored</Text>
          </View>
        </View>

        {/* Media content (image or video) */}
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
              <Text style={styles.bodyText} numberOfLines={3}>{nativeAd.body}</Text>
            </NativeAsset>
          )}
        </View>

        {/* Call to action button */}
        {nativeAd.callToAction && (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
            </TouchableOpacity>
          </NativeAsset>
        )}
      </NativeAdView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adContainer: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
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
    fontWeight: 'bold',
    color: '#333',
  },
  sponsored: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  media: {
    width: '100%',
    height: 180,
    borderRadius: 4,
    marginBottom: 10,
  },
  body: {
    marginBottom: 10,
  },
  advertiser: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginBottom: 5,
  },
  bodyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#5D5DFB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default NativeAdCard;