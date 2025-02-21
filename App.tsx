/**
 * The main entry point of the application.
 * 
 * This component sets up the Redux provider with the application's store
 * and renders the main application navigator.
 * 
 * @returns {JSX.Element} The root component wrapped with the Redux provider.
 */
import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store.js';
import AppNavigator from './navigation/AppNavigator.js';

const App = () => {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;