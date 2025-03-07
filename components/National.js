import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  FlatList, 
  RefreshControl, 
  StatusBar, 
  StyleSheet,
  Animated,
  Text
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import HTMLParser from 'react-native-html-parser';
import NewsCard from './NewsCard';
import { useNavigation } from '@react-navigation/native';
import { saveBookmark, removeBookmark } from './bookmarkUtils';
import LoadingScreen from './LoadingScreen';

const National = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState({});
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 120;

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

  const extractImageUrl = article => {
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
          if (
            value &&
            !value.includes('data:image') &&
            !value.includes('svg+xml')
          ) {
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

  const extractImageUrlWithRegex = htmlContent => {
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
      const response = await fetch(
        'https://www.jagranjosh.com/current-affairs/national-india-1283851987-catlistshow-1',
      );
      const htmlText = await response.text();

      if (!htmlText || htmlText.trim() === '') {
        console.warn('Empty response from Jagran');
        return [];
      }

      try {
        const parser = new HTMLParser.DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const sections = doc.getElementsByClassName('Listing_Listing___EnIi');
        if (!sections.length)
          throw new Error('Could not find the listing section');

        const targetSection = sections[0];
        const articles = targetSection.getElementsByTagName('li');
        const extractedNews = [];

        for (let i = 0; i < articles.length; i++) {
          try {
            const article = articles[i];
            const titleElement = article
              .getElementsByTagName('h3')[0]
              ?.getElementsByTagName('a')[0];
            if (!titleElement) continue;

            const title = titleElement.textContent.trim() || 'No Title';
            const url = titleElement.getAttribute('href') || '#';
            const timeElement = article.getElementsByClassName(
              'Listing_PubDate__LvHzJ',
            )[0];
            const time = timeElement?.textContent.trim() || 'No Time';
            const imageUrl = extractImageUrl(article);

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
              source: 'Jagran Josh',
            });
          } catch (articleError) {
            console.warn(
              'Error parsing individual Jagran article',
              articleError,
            );
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

  const fetchGKTodayNewsWithRegex = async htmlText => {
    try {
      if (!htmlText || htmlText.trim() === '') {
        return [];
      }

      const newsItems = [];

      const h1Pattern =
        /<h1\s+id=["']list["']>\s*<a\s+href=["']([^"']+)["']>([^<]+)<\/a>\s*<\/h1>\s*<div\s+class=["']postmeta-primary["']>\s*<span\s+class=["']meta_date["']>([^<]+)<\/span>/g;

      let match;

      while ((match = h1Pattern.exec(htmlText)) !== null) {
        try {
          const url = match[1];
          const title = match[2].trim();
          const time = match[3].trim();

          const afterMatchText = htmlText.substr(match.index);

          const imgPattern = new RegExp(
            `<div\\s+class=["']featured_image["'][^>]*>\\s*<a\\s+href=["']${url.replace(
              /[.*+?^${}()|[\]\\]/g,
              '\\$&',
            )}["'][^>]*>\\s*<img[^>]+src=["']([^"']+)["']`,
            'i',
          );
          const imgMatch = afterMatchText.match(imgPattern);

          let imageUrl = 'https://via.placeholder.com/600x300';
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1].replace(/&amp;/g, '&');
          }

          let summary = '';
          const summaryPattern =
            /<div\s+class=["']featured_image["'][^>]*>.*?<\/div>\s*<p>([^<]+)<\/p>/is;
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
            source: 'GKToday',
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
      const response = await fetch(
        `https://www.gktoday.in/current-affairs/page/${page}/`,
      );
      const htmlText = await response.text();

      if (!htmlText || htmlText.trim() === '') {
        console.warn(`Empty response from GKToday page ${page}`);
        return [];
      }

      const news = await fetchGKTodayNewsWithRegex(htmlText);
      return news;
    } catch (error) {
      console.error(`Error fetching GKToday news from page ${page}:`, error);
      return [];
    }
  };

  const fetchIndianExpressNews = async () => {
    try {
      const response = await fetch(
        'https://indianexpress.com/about/current-affairs/',
      );
      const htmlText = await response.text();

      if (!htmlText || htmlText.trim() === '') {
        console.warn('Empty response from Indian Express');
        return [];
      }

      try {
        const parser = new HTMLParser.DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const newsDetails = doc.getElementsByClassName('details');
        const extractedNews = [];

        for (let i = 0; i < newsDetails.length; i++) {
          try {
            const detail = newsDetails[i];

            const titleElement = detail
              .getElementsByTagName('h3')[0]
              ?.getElementsByTagName('a')[0];
            if (!titleElement) continue;

            const title = titleElement.textContent.trim() || 'No Title';
            const url = titleElement.getAttribute('href') || '#';

            const paragraphs = detail.getElementsByTagName('p');
            const time = paragraphs[0]?.textContent.trim() || 'No Time';

            let summary = '';
            if (paragraphs && paragraphs.length > 1) {
              summary = paragraphs[1].textContent.trim();
            }

            const thumbDiv = detail.getElementsByClassName('about-thumb')[0];
            let imageUrl = 'https://via.placeholder.com/600x300';

            if (thumbDiv) {
              const imgElement = thumbDiv.getElementsByTagName('img')[0];
              if (imgElement) {
                imageUrl =
                  imgElement.getAttribute('data-src') ||
                  imgElement.getAttribute('src') ||
                  imageUrl;
              }
            }

            extractedNews.push({
              title,
              url,
              time,
              imageUrl,
              summary,
              source: 'Indian Express',
            });
          } catch (articleError) {
            console.warn(
              'Error parsing individual Indian Express article',
              articleError,
            );
            continue;
          }
        }

        return extractedNews;
      } catch (parseError) {
        console.error('Error parsing Indian Express HTML:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching Indian Express news:', error);
      return [];
    }
  };

  const normalizeDate = dateStr => {
    if (!dateStr) return '';

    let normalizedDate = dateStr
      .replace(/^(published|posted|updated):\s*/i, '')
      .trim();

    const ddMonthYearPattern = /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/;
    if (ddMonthYearPattern.test(normalizedDate)) {
      const [_, day, month, year] = normalizedDate.match(ddMonthYearPattern);
      normalizedDate = `${month} ${day}, ${year}`;
    }

    const monthDayYearTimePattern =
      /^([a-zA-Z]+)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s+(am|pm)$/i;
    if (monthDayYearTimePattern.test(normalizedDate)) {
      return normalizedDate;
    }

    return normalizedDate;
  };

  const fetchAllNews = async () => {
    try {
      if (!refreshing) setLoading(true);

      let gkTodayNews = [];
      for (let page = 1; page <= 5; page++) {
        try {
          const news = await fetchGKTodayNews(page);
          gkTodayNews = [...gkTodayNews, ...news];
        } catch (error) {
          console.error(
            `Error fetching GKToday news from page ${page}:`,
            error,
          );
        }
      }

      const jagranNews = await fetchJagranNews();
      const indianExpressNews = await fetchIndianExpressNews();

      const allNews = [...jagranNews, ...gkTodayNews, ...indianExpressNews];

      const sortedNews = allNews.sort((a, b) => {
        try {
          const normalizedTimeA = normalizeDate(a.time);
          const normalizedTimeB = normalizeDate(b.time);

          const dateA = new Date(normalizedTimeA);
          const dateB = new Date(normalizedTimeB);

          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateB - dateA;
          }

          if (a.time.includes('ago') && b.time.includes('ago')) {
            const unitsA = parseInt(a.time.match(/\d+/)?.[0] || '0');
            const unitsB = parseInt(b.time.match(/\d+/)?.[0] || '0');

            if (a.time.includes('minute') && b.time.includes('minute')) {
              return unitsA - unitsB;
            } else if (a.time.includes('hour') && b.time.includes('hour')) {
              return unitsA - unitsB;
            } else if (a.time.includes('day') && b.time.includes('day')) {
              return unitsA - unitsB;
            } else if (a.time.includes('minute') && b.time.includes('hour')) {
              return -1;
            } else if (a.time.includes('hour') && b.time.includes('minute')) {
              return 1;
            } else if (a.time.includes('minute') && b.time.includes('day')) {
              return -1;
            } else if (a.time.includes('day') && b.time.includes('minute')) {
              return 1;
            } else if (a.time.includes('hour') && b.time.includes('day')) {
              return -1;
            } else if (a.time.includes('day') && b.time.includes('hour')) {
              return 1;
            }
          }

          if (
            a.time.toLowerCase().includes('today') &&
            !b.time.toLowerCase().includes('today')
          ) {
            return -1;
          } else if (
            !a.time.toLowerCase().includes('today') &&
            b.time.toLowerCase().includes('today')
          ) {
            return 1;
          } else if (
            a.time.toLowerCase().includes('yesterday') &&
            !b.time.toLowerCase().includes('yesterday')
          ) {
            return b.time.toLowerCase().includes('today') ? 1 : -1;
          } else if (
            !a.time.toLowerCase().includes('yesterday') &&
            b.time.toLowerCase().includes('yesterday')
          ) {
            return a.time.toLowerCase().includes('today') ? -1 : 1;
          }

          return (b.time || '').localeCompare(a.time || '');
        } catch (e) {
          console.warn('Error sorting dates:', e);
          return (a.source || '').localeCompare(b.source || '');
        }
      });

      console.log(`Fetched ${sortedNews.length} news items with summaries`);
      if (sortedNews.length > 0) {
        console.log('First item:', JSON.stringify(sortedNews[0]));
      }

      setNewsList(sortedNews);
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
    return <LoadingScreen />; // Use the LoadingScreen with quotes
  }

  return (
    <View style={{flex: 1, backgroundColor: 'transparent'}}>
    <StatusBar backgroundColor="#1E1E1E" barStyle="light-content" />
    <LinearGradient
      colors={['#E9E8E8FF', '#292929']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.background}
    >
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
        renderItem={({item}) => (
          <NewsCard
            news={item}
            navigation={navigation}
            onBookmark={handleBookmark}
          />
        )}
      />
      </LinearGradient>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  }
});
export default National;
