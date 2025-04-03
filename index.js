/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import HeadlessTask from './components/HeadlessTask';
import notifee from '@notifee/react-native';

import { registerBackgroundHandler } from './components/NotificationScheduler';

// Pass a callback function to handle notification press in the background
registerBackgroundHandler((notification) => {
  console.log('Background notification handled from index.js:', notification);
  // Can't navigate from here directly, but can store info for when app opens
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Background event received:', type, detail);
  return Promise.resolve();
});

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('HeadlessTask', () => HeadlessTask);