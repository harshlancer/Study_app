import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import NewsCard from './NewsCard';
import { getBookmarks, removeBookmark } from './bookmarkUtils';

const Bookmarks = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const savedBookmarks = await getBookmarks();
      setBookmarks(savedBookmarks);
      setLoading(false);
    };

    fetchBookmarks();
  }, []);

  const handleBookmark = async (newsItem, isBookmarked) => {
    if (!isBookmarked) {
      // Remove the article from bookmarks
      await removeBookmark(newsItem);
      // Update the bookmarks list
      const updatedBookmarks = bookmarks.filter((item) => item.url !== newsItem.url);
      setBookmarks(updatedBookmarks);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <NewsCard
            news={item}
            navigation={navigation}
            isBookmarked={true} // Force bookmark icon to be dark
            onBookmark={handleBookmark} // Pass the handleBookmark function
          />
        )}
      />
    </View>
  );
};

export default Bookmarks;