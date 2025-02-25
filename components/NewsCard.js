import React, { useEffect, useState }  from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const NewsCard = ({ news, navigation, onBookmark, isBookmarked: isInitiallyBookmarked }) => {
  const [isBookmarked, setIsBookmarked] = useState(isInitiallyBookmarked || false);

  useEffect(() => {
    setIsBookmarked(isInitiallyBookmarked || false);
  }, [isInitiallyBookmarked]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(news, !isBookmarked); // Pass the news item and bookmark status
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('WebViewScreen', { url: news.url })}
      activeOpacity={0.97}
    >
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
          <Text style={styles.title} numberOfLines={2}>
            {news.title}
          </Text>
          <Text style={styles.summary} numberOfLines={3}>
            {news.summary}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.readMore}>Read more</Text>
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
        </View>
      </View>
    </TouchableOpacity>
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
  readMore: {
    color: '#2575fc',
    fontSize: 14,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 8,
  },
});

export default NewsCard;