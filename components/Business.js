import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, StatusBar, Text } from 'react-native';
import HTMLParser from 'react-native-html-parser';
import NewsCard from './NewsCard';
import { useNavigation } from '@react-navigation/native';

const Business = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchIndianExpressNews = async () => {
    try {
      const response = await fetch('https://indianexpress.com/section/business/');
      const htmlText = await response.text();
      
      console.log(`Response received, length: ${htmlText.length} characters`);
  
      if (!htmlText || htmlText.trim() === '') {
        console.log('Empty response from Indian Express');
        return [];
      }
  
      try {
        console.log('Parsing HTML with DOMParser');
        const parser = new HTMLParser.DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Check for articles
        const articles = doc.getElementsByClassName('articles');
        console.log(`Found ${articles.length} elements with class 'articles'`);
        
        if (articles.length === 0) {
          // Log some classes to help identify the structure
          const allElements = doc.getElementsByTagName('*');
          const classNames = new Set();
          
          for (let i = 0; i < Math.min(allElements.length, 100); i++) {
            const className = allElements[i].getAttribute('class');
            if (className) {
              className.split(' ').forEach(cls => classNames.add(cls));
            }
          }
          
          console.log('Some classes found in the document:', Array.from(classNames).slice(0, 20).join(', '));
          
          // Try to identify possible article containers
          const titleElements = doc.getElementsByClassName('title');
          console.log(`Found ${titleElements.length} elements with class 'title'`);
          
          return [];
        }
  
        const extractedNews = [];
        console.log(`Processing ${articles.length} articles`);
  
        for (let i = 0; i < articles.length; i++) {
          try {
            const article = articles[i];
            
            // Print the HTML of the first article for inspection
            if (i === 0) {
              console.log('First article HTML structure:', article.toString().substring(0, 500) + '...');
            }
            
            // Find img-context
            const imgContexts = article.getElementsByClassName('img-context');
            console.log(`Article ${i+1}: Found ${imgContexts.length} img-context elements`);
            
            if (!imgContexts || imgContexts.length === 0) {
              continue;
            }
            
            const imgContext = imgContexts[0];
            
            // Extract title and URL
            const titleElements = imgContext.getElementsByClassName('title');
            console.log(`Article ${i+1}: Found ${titleElements.length} title elements`);
            
            if (!titleElements || titleElements.length === 0) {
              continue;
            }
            
            const titleElement = titleElements[0];
            const anchorElements = titleElement.getElementsByTagName('a');
            console.log(`Article ${i+1}: Found ${anchorElements.length} anchor elements in title`);
            
            if (!anchorElements || anchorElements.length === 0) {
              continue;
            }
            
            const anchor = anchorElements[0];
            const title = anchor.textContent.trim() || 'No Title';
            const url = anchor.getAttribute('href') || '#';
            
            console.log(`Article ${i+1}: Title "${title.substring(0, 30)}..." URL: ${url.substring(0, 30)}...`);
            
            // Extract date
            const dateElements = imgContext.getElementsByClassName('date');
            let time = 'No Time';
            
            if (dateElements && dateElements.length > 0) {
              time = dateElements[0].textContent.trim();
              console.log(`Article ${i+1}: Date "${time}"`);
            }
            
            // Extract summary
            const paragraphs = imgContext.getElementsByTagName('p');
            let summary = 'No summary available';
            
            if (paragraphs && paragraphs.length > 0) {
              summary = paragraphs[0].textContent.trim();
              console.log(`Article ${i+1}: Summary "${summary.substring(0, 30)}..."`);
            }
            
            // Extract image from snaps div
            const snapsElements = article.getElementsByClassName('snaps');
            let imageUrl = 'https://via.placeholder.com/600x300';
            
            if (snapsElements && snapsElements.length > 0) {
              const imgElements = snapsElements[0].getElementsByTagName('img');
              
              if (imgElements && imgElements.length > 0) {
                const img = imgElements[0];
                // Try data-src first (for lazy-loaded images) then fall back to src
                imageUrl = img.getAttribute('data-src') || img.getAttribute('src') || imageUrl;
                console.log(`Article ${i+1}: Image URL found`);
              }
            }
            
            extractedNews.push({ 
              title, 
              url, 
              time, 
              imageUrl,
              summary,
              source: 'Indian Express'
            });
            
            console.log(`Successfully extracted article ${i+1}`);
          } catch (articleError) {
            console.warn(`Error parsing article ${i+1}:`, articleError);
            continue;
          }
        }
  
        console.log(`Extraction complete. Found ${extractedNews.length} valid articles.`);
        return extractedNews;
      } catch (parseError) {
        console.error('Error parsing HTML:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  };

  const fetchAllNews = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const indianExpressNews = await fetchIndianExpressNews();
      
      console.log(`Fetched ${indianExpressNews.length} news items with summaries`);
      if (indianExpressNews.length > 0) {
        console.log('First item:', JSON.stringify(indianExpressNews[0]));
      } else {
        console.log('No news items were extracted');
      }
      
      setNewsList(indianExpressNews);
    } catch (error) {
      console.error('Error in fetchAllNews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllNews();
  };

  const handleBookmark = async (newsItem, isBookmarked) => {
    // Your bookmark handling code here
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar backgroundColor="#0000ff" barStyle="light-content" />
      {newsList.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No news articles found. Pull down to refresh.</Text>
          <Text style={{ marginTop: 10, color: 'gray' }}>Check console logs for debugging information</Text>
        </View>
      ) : (
        <FlatList
          data={newsList}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0000ff']}
            />
          }
          renderItem={({ item }) => (
            <NewsCard news={item} navigation={navigation} onBookmark={handleBookmark} />
          )}
        />
      )}
    </View>
  );
};

export default Business;