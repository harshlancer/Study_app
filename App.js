// App.js
import React, {useEffect, useRef} from 'react';
import {Provider} from 'react-redux';
import store from './store/store.js';
import AppNavigator from './navigation/AppNavigator'; // Changed to default import
import {Platform, Linking, Alert} from 'react-native';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {
  scheduleNotification,
  setupNotificationListeners,
  listScheduledNotifications,
  registerBackgroundHandler,
  sendTestNotification,
} from './components/NotificationScheduler.js';
import {
  initializeMemeNotifications,
  sendImmediateMemeNotification,
} from './components/MemeScheduler.js';
import HTMLParser from 'react-native-html-parser';

// Function to fetch initial news data
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

    const article = articles[0];
    const titleElement = article
      .getElementsByTagName('h3')[0]
      ?.getElementsByTagName('a')[0];
    const title = titleElement?.textContent.trim() || 'News Update';
    const summary =
      article.getElementsByTagName('p')[0]?.textContent.trim() ||
      'Check out the latest news';
    const imageUrl =
      article.getElementsByTagName('img')[0]?.getAttribute('src') || null;

    console.log('Fetched news:', {title, summary, imageUrl});
    return {title, summary, imageUrl};
  } catch (error) {
    console.error('Error fetching initial news:', error);
    return null;
  }
};

// Handle deep linking
const handleDeepLink = (url, navigationRef) => {
  if (!url || !navigationRef.current) return;

  console.log('Handling deep link:', url);
  const route = url.replace(/.*?:\/\//g, '');
  const [screen, params] = route.split('/');

  if (screen === 'currentaffairs') {
    navigationRef.current.navigate('CurrentAffairs');
  } else if (screen === 'news') {
    navigationRef.current.navigate('NewsScreen', {
      newsItem: params ? JSON.parse(params) : null,
    });
  }
};

const App = () => {
  const navigationRef = useRef(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request permission
        const settings = await notifee.requestPermission();
        console.log('Notification settings:', settings);

        // Check if we have permission
        if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
          console.warn('Notification permission not granted');
          Alert.alert(
            'Notification Permission',
            'Please enable notifications in your device settings to receive updates.',
          );
          return;
        }

        // For Android, request exact alarm permission
        if (Platform.OS === 'android') {
          const hasPermission = await notifee.isExactAlarmPermissionGranted();
          if (!hasPermission) {
            await notifee.requestExactAlarmPermission();
          }
        }

        // Send a test notification to check if notifications are working
        await sendTestNotification();

        // Fetch news and schedule notifications
        const newsItem = await fetchInitialNews();
        let newsScheduled = false;

        if (newsItem) {
          try {
            await scheduleNotification(newsItem);
            newsScheduled = true;
            console.log('News notification scheduled successfully');
          } catch (error) {
            console.error('Failed to schedule news notifications:', error);
          }
        } else {
          console.warn('No news item fetched, skipping news notification');
        }

        // Initialize meme notifications
        await initializeMemeNotifications();

        // List scheduled notifications for debugging
        const scheduledNotifications = await listScheduledNotifications();
        console.log(
          `Total scheduled notifications: ${scheduledNotifications.length}`,
        );
      } catch (error) {
        console.error('Error in initialization:', error);
      }
    };

    // Set up notification listeners
    const unsubscribeForeground = setupNotificationListeners(notification => {
      handleNotificationPress(notification, navigationRef);
    });

    // Register background handler
    const unsubscribeBackground = registerBackgroundHandler(notification => {
      handleNotificationPress(notification, navigationRef);
    });

    // Set up deep linking
    const linkingSubscription = Linking.addEventListener('url', ({url}) => {
      handleDeepLink(url, navigationRef);
    });

    // Check for initial URL (from deep link)
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url, navigationRef);
    });

    // Initialize notifications
    initializeNotifications();

    // Clean up
    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeBackground) unsubscribeBackground();
      if (linkingSubscription) linkingSubscription.remove();
    };
  }, []);

  // Handle notification press
  const handleNotificationPress = (notification, navigationRef) => {
    if (!navigationRef.current) {
      console.warn('Navigation ref not available');
      return;
    }

    console.log('Handling notification press:', notification);
    const notificationType = notification?.data?.type;

    if (notificationType === 'news') {
      navigationRef.current.navigate('NewsScreen', {
        newsItem: notification.data,
      });
    } else if (notificationType === 'meme') {
      navigationRef.current.navigate('CurrentAffairs');
    }
  };

  return (
    <Provider store={store}>
      <AppNavigator ref={navigationRef} />
    </Provider>
  );
};

export default App;