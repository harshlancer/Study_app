import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store/store.js';
import AppNavigator from './navigation/AppNavigator.js';
import notifee from '@notifee/react-native';
import { scheduleNotification, setupNotificationListeners, listScheduledNotifications } from './components/NotificationScheduler.js';
import { initializeMemeNotifications, sendImmediateMemeNotification } from './components/MemeScheduler.js';
import HTMLParser from 'react-native-html-parser';

// Function to fetch initial news data (adapted from National.js)
const fetchInitialNews = async () => {
  try {
    const response = await fetch(
      'https://www.jagranjosh.com/current-affairs/national-india-1283851987-catlistshow-1',
    );
    const htmlText = await response.text();

    if (!htmlText || htmlText.trim() === '') {
      console.warn('Empty response from Jagran');
      return null;
    }

    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const sections = doc.getElementsByClassName('Listing_Listing___EnIi');
    if (!sections.length) {
      console.warn('No listing section found');
      return null;
    }

    const targetSection = sections[0];
    const articles = targetSection.getElementsByTagName('li');
    if (!articles.length) {
      console.warn('No articles found');
      return null;
    }

    const article = articles[0]; // Take the first article
    const titleElement = article.getElementsByTagName('h3')[0]?.getElementsByTagName('a')[0];
    const title = titleElement?.textContent.trim() || 'No Title';
    const summary = article.getElementsByTagName('p')[0]?.textContent.trim() || 'No Summary';
    const imageUrl = article.getElementsByTagName('img')[0]?.getAttribute('src') || 'https://via.placeholder.com/600x300';

    return { title, summary, imageUrl };
  } catch (error) {
    console.error('Error fetching initial news:', error);
    return null;
  }
};

const App = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      // Request notification permissions
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= 1) {
        console.log('Notification permissions granted');
  
        // Fetch initial news data
        const newsItem = await fetchInitialNews();
        let newsScheduled = false;
  
        if (newsItem) {
          try {
            // Schedule the news notification every 3 hours
            await scheduleNotification(newsItem);
            newsScheduled = true;
            console.log('News notifications scheduled successfully');
          } catch (error) {
            console.error('Failed to schedule news notifications:', error);
          }
        } else {
          console.warn('No news item fetched, skipping news notification');
        }
  
        // Initialize daily meme notifications regardless of news status
        await initializeMemeNotifications();
  
        // If news notifications failed, send an immediate meme as fallback
        if (!newsScheduled) {
          console.log('Sending immediate meme notification as fallback');
          try {
            await sendImmediateMemeNotification();
          } catch (memeError) {
            console.error('Even fallback meme notification failed:', memeError);
          }
        }
  
        // Log scheduled notifications for debugging
        await listScheduledNotifications();
      } else {
        console.log('Notification permissions denied');
      }
  
      // Set up listeners
      const unsubscribe = setupNotificationListeners();
  
      return () => unsubscribe();
    };
  
    initializeNotifications();
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;