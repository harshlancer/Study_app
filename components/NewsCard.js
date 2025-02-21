import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const NewsCard = ({ news, navigation }) => {
  // Format the date if possible for better display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      // Handle relative dates
      if (dateStr.includes('ago') || 
          dateStr.toLowerCase().includes('today') || 
          dateStr.toLowerCase().includes('yesterday')) {
        return dateStr;
      }
      
      // Try to parse and format the date
      const date = new Date(dateStr.replace(/^(published|posted|updated):\s*/i, ''));
      if (!isNaN(date.getTime())) {
        // Format: Feb 19, 2025
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      
      // Return original if parsing fails
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('WebViewScreen', { url: news.url })}
      style={styles.card}
    >
      <Image 
        source={{ uri: news.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{news.title}</Text>
        {news.summary ? (
          <Text style={styles.summary} numberOfLines={3}>{news.summary}</Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.time}>{formatDate(news.time)}</Text>
          <Text style={styles.source}>{news.source}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200
  },
  contentContainer: {
    padding: 12
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24
  },
  summary: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    alignItems: 'center'
  },
  time: {
    fontSize: 12,
    color: '#666'
  },
  source: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0066cc',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  }
});

export default NewsCard;