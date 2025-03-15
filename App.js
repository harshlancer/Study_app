import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store/store.js';
import AppNavigator from './navigation/AppNavigator.js';
import notifee from '@notifee/react-native';
import { scheduleNotification, setupNotificationListeners } from './components/NotificationScheduler.js';

const App = () => {
  useEffect(() => {
    // Request notification permissions
    const requestNotificationPermissions = async () => {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= 1) {
        console.log('Notification permissions granted');
        // Schedule the first notification
        await scheduleNotification();
      } else {
        console.log('Notification permissions denied');
      }
    };

    requestNotificationPermissions();

    // Set up notification event listeners
    const unsubscribe = setupNotificationListeners();

    // Clean up listeners when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;