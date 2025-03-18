/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import HeadlessTask from './components/HeadlessTask';
import { registerBackgroundHandler } from './components/NotificationScheduler';
registerBackgroundHandler();
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('HeadlessTask', () => HeadlessTask);
