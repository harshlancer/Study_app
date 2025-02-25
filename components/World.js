import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator,StatusBar } from 'react-native';
import HTMLParser from 'react-native-html-parser';
import NewsCard from './NewsCard';
import { useNavigation } from '@react-navigation/native';
import { saveBookmark, removeBookmark } from './bookmarkUtils';
import CategoryBar from './CategoryBar';
const World = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAllNews();
  }, []);

  const handleBookmark = async (newsItem, isBookmarked) => {
    if (isBookmarked) {
      await saveBookmark(newsItem);
    } else {
      await removeBookmark(newsItem);
    }
  };

  const extractImageUrl = (article) => {
    try {
      if (!article) return 'https://via.placeholder.com/600x300';
      
      const noscriptElement = article.getElementsByTagName('noscript')[0];
      if (noscriptElement) {
        const noscriptImg = noscriptElement.getElementsByTagName('img')[0];
        if (noscriptImg) {
          const src = noscriptImg.getAttribute('src');
          if (src) return src;
        }
      }

      const imgElement = article.getElementsByTagName('img')[0];
      if (imgElement) {
        const possibleAttributes = ['src', 'data-src', 'data-nimg'];
        for (const attr of possibleAttributes) {
          const value = imgElement.getAttribute(attr);
          if (value && !value.includes('data:image') && !value.includes('svg+xml')) {
            return value;
          }
        }

        const style = imgElement.getAttribute('style');
        if (style) {
          const match = style.match(/background-image:url\("([^"]+)"\)/);
          if (match && match[1]) return match[1];
        }
      }

      return 'https://via.placeholder.com/600x300';
    } catch (error) {
      console.error('Error extracting image:', error);
      return 'https://via.placeholder.com/600x300';
    }
  };

  // Extract image URLs using regex
  const extractImageUrlWithRegex = (htmlContent) => {
    try {
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
      const match = htmlContent.match(imgRegex);
      
      if (match && match[1]) {
        const url = match[1].replace(/&amp;/g, '&');
        return url;
      }
      
      return 'https://via.placeholder.com/600x300';
    } catch (error) {
      console.error('Error extracting image with regex:', error);
      return 'https://via.placeholder.com/600x300';
    }
  };

  const fetchJagranNews = async () => {
    try {
      const response = await fetch('https://www.jagranjosh.com/current-affairs/international-world-1283850903-catlistshow-1');
      const htmlText = await response.text();

      if (!htmlText || htmlText.trim() === '') {
        console.warn('Empty response from Jagran');
        return [];
      }

      try {
        const parser = new HTMLParser.DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const sections = doc.getElementsByClassName('Listing_Listing___EnIi');
        if (!sections.length) throw new Error('Could not find the listing section');

        const targetSection = sections[0];
        const articles = targetSection.getElementsByTagName('li');
        const extractedNews = [];

        for (let i = 0; i < articles.length; i++) {
          try {
            const article = articles[i];
            const titleElement = article.getElementsByTagName('h3')[0]?.getElementsByTagName('a')[0];
            if (!titleElement) continue;
            
            const title = titleElement.textContent.trim() || 'No Title';
            const url = titleElement.getAttribute('href') || '#';
            const timeElement = article.getElementsByClassName('Listing_PubDate__LvHzJ')[0];
            const time = timeElement?.textContent.trim() || 'No Time';
            const imageUrl = extractImageUrl(article);
            
            // Extract summary if available
            let summary = '';
            const paragraphs = article.getElementsByTagName('p');
            if (paragraphs && paragraphs.length > 0) {
              summary = paragraphs[0].textContent.trim();
            }

            extractedNews.push({ 
              title, 
              url, 
              time, 
              imageUrl,
              summary,
              source: 'Jagran Josh'
            });
          } catch (articleError) {
            console.warn('Error parsing individual Jagran article', articleError);
            continue;
          }
        }

        return extractedNews;
      } catch (parseError) {
        console.error('Error parsing Jagran HTML:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching Jagran news:', error);
      return [];
    }
  };

  // Improved regex-based implementation with summary extraction
  const fetchGKTodayNewsWithRegex = async (htmlText) => {
    try {
      if (!htmlText || htmlText.trim() === '') {
        return [];
      }
  
      const newsItems = [];
  
      // Find h1 elements with id="list" and extract articles
      const h1Pattern = /<h1\s+id=["']list["']>\s*<a\s+href=["']([^"']+)["']>([^<]+)<\/a>\s*<\/h1>\s*<div\s+class=["']postmeta-primary["']>\s*<span\s+class=["']meta_date["']>([^<]+)<\/span>/g;
  
      let match;
  
      while ((match = h1Pattern.exec(htmlText)) !== null) {
        try {
          const url = match[1];
          const title = match[2].trim();
          const time = match[3].trim();
  
          // Get the substring after this match to look for image and summary
          const afterMatchText = htmlText.substr(match.index);
  
          // Extract image URL
          const imgPattern = new RegExp(`<div\\s+class=["']featured_image["'][^>]*>\\s*<a\\s+href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>\\s*<img[^>]+src=["']([^"']+)["']`, 'i');
          const imgMatch = afterMatchText.match(imgPattern);
  
          let imageUrl = 'https://via.placeholder.com/600x300';
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1].replace(/&amp;/g, '&');
          }
  
          // Extract summary from the paragraph following the featured image div
          let summary = '';
          const summaryPattern = /<div\s+class=["']featured_image["'][^>]*>.*?<\/div>\s*<p>([^<]+)<\/p>/is;
          const summaryMatch = afterMatchText.match(summaryPattern);
  
          if (summaryMatch && summaryMatch[1]) {
            summary = summaryMatch[1].trim();
          }
  
          newsItems.push({
            title,
            url,
            time,
            imageUrl,
            summary,
            source: 'GKToday'
          });
        } catch (itemError) {
          console.warn('Error processing regex match:', itemError);
        }
      }
  
      return newsItems;
    } catch (error) {
      console.error('Error in fetchGKTodayNewsWithRegex:', error);
      return [];
    }
  };

  const fetchGKTodayNews = async (page = 1) => {
    try {
      const response = await fetch(`https://www.gktoday.in/current-affairs/international-current-affairs/page/${page}/`);
      const htmlText = await response.text();
  
      if (!htmlText || htmlText.trim() === '') {
        console.warn(`Empty response from GKToday page ${page}`);
        return [];
      }
  
      console.log(`Fetched HTML for page ${page}`); // Debugging
      const news = await fetchGKTodayNewsWithRegex(htmlText);
      console.log(`Fetched ${news.length} items from page ${page}`); // Debugging
      return news;
    } catch (error) {
      console.error(`Error fetching GKToday news from page ${page}:`, error);
      return [];
    }
  };


  const normalizeDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Remove common prefixes
    let normalizedDate = dateStr.replace(/^(published|posted|updated):\s*/i, '').trim();
    
    // Handle common format variations
    // Convert "DD Month YYYY" to "Month DD, YYYY" for better parsing
    const ddMonthYearPattern = /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/;
    if (ddMonthYearPattern.test(normalizedDate)) {
      const [_, day, month, year] = normalizedDate.match(ddMonthYearPattern);
      normalizedDate = `${month} ${day}, ${year}`;
    }
    
    // Handle Indian Express format: "February 21, 2025 10:33 am"
    const monthDayYearTimePattern = /^([a-zA-Z]+)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s+(am|pm)$/i;
    if (monthDayYearTimePattern.test(normalizedDate)) {
      // This format is already well-parseable by Date constructor, so just return it
      return normalizedDate;
    }
    
    return normalizedDate;
  };
  
  const fetchAllNews = async () => {
    try {
      if (!refreshing) setLoading(true);
  
      // Fetch news from GKToday pages 1 to 5
      let gkTodayNews = [];
      for (let page = 1; page <= 5; page++) {
        try {
          const news = await fetchGKTodayNews(page);
          gkTodayNews = [...gkTodayNews, ...news];
        } catch (error) {
          console.error(`Error fetching GKToday news from page ${page}:`, error);
        }
      }
  
      // Get Jagran news
      const jagranNews = await fetchJagranNews();
  
      // Show GKToday news first, then Jagran news
      const allNews = [...gkTodayNews, ...jagranNews];
  
      setNewsList(allNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllNews();
  };

  if (loading && !refreshing) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar backgroundColor="#0000ff" barStyle="light-content" />
      <FlatList
        data={newsList}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0000ff']} />}
        renderItem={({ item }) => (
          <NewsCard news={item} navigation={navigation} onBookmark={handleBookmark} />
        )}
      />
    </View>
  );
};

export default World;