import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import CategoryBar from './CategoryBar';
import National from './National';
import World from './World';
import MCQScreen from './MCQScreen';
import WCQscreen from './WCQscreen';
import WeeklyCurrentAffairs from './WeeklyCurrentAffairs';
import Bookmarks from './Bookmarks';

const Tab = createMaterialTopTabNavigator();

const CategoryTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CategoryBar {...props} />}
      screenOptions={{
        swipeEnabled: true, // Optional: enable swiping between tabs
      }}
    >
      <Tab.Screen name="National" component={National} />
      <Tab.Screen name="World" component={World} />
      <Tab.Screen name="National MCQs" component={MCQScreen} />
      <Tab.Screen name="World MCQs" component={WCQscreen} />
      <Tab.Screen name="WeeklyCurrentAffairs" component={WeeklyCurrentAffairs} />
      <Tab.Screen name="Bookmarks" component={Bookmarks} />
    </Tab.Navigator>
  );
};

export default CategoryTabNavigator;