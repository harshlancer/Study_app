import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import HTMLParser from 'react-native-html-parser';
import NewsCard from './NewsCard';
import { useNavigation } from '@react-navigation/native';
import { saveBookmark, removeBookmark } from './bookmarkUtils';
import LoadingScreen from './LoadingScreen';
import { scheduleNotification } from './NotificationScheduler';
import {
  NativeAd,
  NativeMediaView,
  NativeMediaAspectRatio,
  NativeAdChoicesPlacement,
} from 'react-native-google-mobile-ads';
import NativeAdCard from './NativeAdCard';
import { fetchNationalNews } from '../services/newsService'; // Adjust the import path as needed
const AD_UNIT_IDS = [
  "ca-app-pub-3382805190620235/3239205147", // First ad unit
  "ca-app-pub-3382805190620235/4943733703", // Second ad unit
  "ca-app-pub-3382805190620235/3630652032", // Third ad unit
];

const National = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState({});
  const [nativeAds, setNativeAds] = useState([]); // Array to hold multiple ads
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current; // Array to hold multiple ads
  useEffect(() => {
    fetchAllNews();

    // Load all native ads
    const loadAds = async () => {
      const loadedAds = [];
      for (const adUnitId of AD_UNIT_IDS) {
        try {
          const ad = await NativeAd.createForAdRequest(adUnitId, {
            aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
            adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
            startVideoMuted: true,
          });
          loadedAds.push(ad);
        } catch (error) {
          console.error(`Error loading native ad ${adUnitId}:`, error);
        }
      }
      setNativeAds(loadedAds);
    };

    loadAds();

    // Cleanup function to destroy all ads
    return () => {
      nativeAds.forEach(ad => ad?.destroy());
    };
  }, []);
  const handleBookmark = async (newsItem, isBookmarked) => {
    if (isBookmarked) {
      await saveBookmark(newsItem);
    } else {
      await removeBookmark(newsItem);
    }
  };
  const renderItem = ({ item, index }) => {
    // Show ad after every 3 items, but never as the first item
    if (index > 0 && index % 3 === 0 && nativeAds.length > 0) {
      // Rotate ads based on index
      const adIndex = Math.floor(index / 3) % nativeAds.length;
      const selectedAd = nativeAds[adIndex];
      return (
        <>
          <NewsCard
            news={item}
            navigation={navigation}
            onBookmark={handleBookmark}
          />
          {selectedAd && <NativeAdCard nativeAd={selectedAd} />}
        </>
      );
    }

    return (
      <NewsCard
        news={item}
        navigation={navigation}
        onBookmark={handleBookmark}
      />
    );
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

      // Parse dates from different formats to Date objects
      const parseDateString = (dateStr, source) => {
        if (!dateStr) return new Date(0); // Default to epoch if no date

        const now = new Date();
        const normalizedDateStr = dateStr.toLowerCase().trim();

        // Case 1: Relative time (e.g., "1 day ago", "2 days ago") - Jagran Josh
        if (
          normalizedDateStr.includes('day ago') ||
          normalizedDateStr.includes('days ago')
        ) {
          const daysAgo = parseInt(normalizedDateStr.match(/\d+/)?.[0] || '0');
          return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        }

        // Case 2: Relative time with hours
        if (
          normalizedDateStr.includes('hour ago') ||
          normalizedDateStr.includes('hours ago')
        ) {
          const hoursAgo = parseInt(normalizedDateStr.match(/\d+/)?.[0] || '0');
          return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        }

        // Case 3: Relative time with minutes
        if (
          normalizedDateStr.includes('minute ago') ||
          normalizedDateStr.includes('minutes ago')
        ) {
          const minutesAgo = parseInt(
            normalizedDateStr.match(/\d+/)?.[0] || '0',
          );
          return new Date(now.getTime() - minutesAgo * 60 * 1000);
        }

        // Case 4: Today or Yesterday
        if (normalizedDateStr.includes('today')) {
          return new Date(now.setHours(0, 0, 0, 0));
        }

        if (normalizedDateStr.includes('yesterday')) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          return yesterday;
        }

        // Case 5: Format like "March 13, 2025" (GKToday)
        const monthDayYearPattern = /([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/i;
        const monthDayYearMatch = normalizedDateStr.match(monthDayYearPattern);
        if (monthDayYearMatch) {
          const [_, month, day, year] = monthDayYearMatch;

          // Case 5.1: Format with time like "March 13, 2025 8:08 pm" (Indian Express)
          const timePattern = /(\d{1,2})[:.](\d{2})\s*(am|pm)/i;
          const timeMatch = normalizedDateStr.match(timePattern);

          if (timeMatch) {
            const [__, hours, minutes, ampm] = timeMatch;
            let hour = parseInt(hours);

            // Convert 12-hour format to 24-hour format
            if (ampm.toLowerCase() === 'pm' && hour < 12) {
              hour += 12;
            } else if (ampm.toLowerCase() === 'am' && hour === 12) {
              hour = 0;
            }

            return new Date(
              year,
              getMonthIndex(month),
              parseInt(day),
              hour,
              parseInt(minutes),
            );
          }

          // Just date without time
          return new Date(year, getMonthIndex(month), parseInt(day));
        }

        // Case 6: Try native date parsing as fallback
        const fallbackDate = new Date(normalizedDateStr);
        if (!isNaN(fallbackDate.getTime())) {
          return fallbackDate;
        }

        // If all parsing attempts fail, return current date minus a large number
        // based on source to maintain some consistency in the sort order
        console.warn(
          `Could not parse date: "${dateStr}" from source: ${source}`,
        );
        return new Date();
      };

      // Helper to convert month name to month index (0-11)
      const getMonthIndex = monthName => {
        const months = {
          january: 0,
          jan: 0,
          february: 1,
          feb: 1,
          march: 2,
          mar: 2,
          april: 3,
          apr: 3,
          may: 4,
          june: 5,
          jun: 5,
          july: 6,
          jul: 6,
          august: 7,
          aug: 7,
          september: 8,
          sep: 8,
          sept: 8,
          october: 9,
          oct: 9,
          november: 10,
          nov: 10,
          december: 11,
          dec: 11,
        };

        return months[monthName.toLowerCase()] || 0;
      };

      // Sort news items by parsed date (newest first)
      const sortedNews = allNews.sort((a, b) => {
        const dateA = parseDateString(a.time, a.source);
        const dateB = parseDateString(b.time, b.source);

        // Debug information for troubleshooting
        if (process.env.NODE_ENV === 'development') {
          
        }

        return dateB.getTime() - dateA.getTime();
      });

      if (sortedNews.length > 0 && process.env.NODE_ENV === 'development') {
        sortedNews.slice(0, 3).forEach((item, i) => {
          
        });
      }

      setNewsList(sortedNews);
      // Trigger the notification scheduler with the latest news
      if (sortedNews.length > 0) {
        await scheduleNotification(sortedNews[0]); // Send the first news item as a notification
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const updateNotification = async () => {
    if (newsList.length > 0) {
      await scheduleNotification(newsList[0]); // Reschedule with latest news
    }
  };
  useEffect(() => {
    updateNotification();
  }, [newsList]);
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
        style={styles.background}>
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
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  },
});
export default National;
