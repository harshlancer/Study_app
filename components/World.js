import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import HTMLParser from 'react-native-html-parser';
import NewsCard from './NewsCard';
import {useNavigation} from '@react-navigation/native';
import {saveBookmark, removeBookmark} from './bookmarkUtils';
import LoadingScreen from './LoadingScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeMediaView,
  NativeMediaAspectRatio,
  NativeAssetType,
  NativeAdChoicesPlacement,
  TestIds,
} from 'react-native-google-mobile-ads';
import NativeAdCard from './NativeAdCard';

const World = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nativeAd, setNativeAd] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAllNews();

    // Load native ad
    const loadAd = async () => {
      try {
        const ad = await NativeAd.createForAdRequest(
          'ca-app-pub-3382805190620235/1514257602',
          {
            aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
            adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
            startVideoMuted: true,
          },
        );
        setNativeAd(ad);
      } catch (error) {
        console.error('Error loading native ad:', error);
      }
    };

    loadAd();

    return () => {
      if (nativeAd && typeof nativeAd.destroy === 'function') {
        nativeAd.destroy();
      }
    };
  }, []);

  const handleBookmark = async (newsItem, isBookmarked) => {
    if (isBookmarked) {
      await saveBookmark(newsItem);
    } else {
      await removeBookmark(newsItem);
    }
  };

  const renderItem = ({item, index}) => {
    // Show ad after every 5 items, but never as the first item
    if (index > 0 && index % 5 === 0 && nativeAd) {
      return (
        <>
          <NewsCard
            news={item}
            navigation={navigation}
            onBookmark={handleBookmark}
          />
          <NativeAdCard nativeAd={nativeAd} />
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
        'https://www.jagranjosh.com/current-affairs/international-world-1283850903-catlistshow-1',
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
        `https://www.gktoday.in/current-affairs/international-current-affairs/page/${page}/`,
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

  const parseDate = dateStr => {
    if (!dateStr) return new Date(0);

    if (dateStr.includes('hours ago') || dateStr.includes('hour ago')) {
      const hours = parseInt(dateStr);
      const date = new Date();
      date.setHours(date.getHours() - hours);
      return date;
    }

    if (dateStr.includes('days ago') || dateStr.includes('day ago')) {
      const days = parseInt(dateStr);
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    }

    if (dateStr.includes('month ago') || dateStr.includes('months ago')) {
      const months = parseInt(dateStr) || 1;
      const date = new Date();
      date.setMonth(date.getMonth() - months);
      return date;
    }

    return new Date(dateStr);
  };

  const sortNewsByDate = newsItems => {
    return [...newsItems].sort((a, b) => {
      const dateA = parseDate(a.time);
      const dateB = parseDate(b.time);
      return dateB - dateA;
    });
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

      const allNews = [...gkTodayNews, ...jagranNews];

      const sortedNews = sortNewsByDate(allNews);

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
    return <LoadingScreen />;
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
    backgroundColor: '#121212',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    minHeight: '100%',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    color: '#BDBDBD',
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 400,
  },
  emptyText: {
    color: '#BDBDBD',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#5D5DFB',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  background: {
    flex: 1,
  },
});

export default World;
