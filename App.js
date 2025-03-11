import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store/store.js';
import AppNavigator from './navigation/AppNavigator.js';
import notifee from '@notifee/react-native';

const App = () => {
  useEffect(() => {
    async function initializeApp() {
      // Request notification permissions
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= 1) {
        console.log('Notification permissions granted');
        // Schedule notifications
        await scheduleNotifications();
      } else {
        console.log('Notification permissions denied');
      }
    }

    initializeApp();
  }, []);

  async function scheduleNotifications() {
    try {
      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      // Schedule a notification for 15 seconds from now
      await notifee.createTriggerNotification(
        {
          title: 'Test Notification',
          body: 'This is a test notification scheduled for 15 seconds later!',
          android: {
            channelId,
          },
        },
        {
          type: 0, // TIMESTAMP trigger type
          timestamp: Date.now() + 15 * 1000, // 15 seconds from now
        },
      );

      console.log('Notification scheduled to appear in 15 seconds!');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;