/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import HeadlessTask from './components/HeadlessTask';
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('HeadlessTask', () => HeadlessTask);
