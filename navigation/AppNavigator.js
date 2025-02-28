import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import National from '../components/National';
import WebViewScreen from '../components/WebViewScreen';
import Bookmarks from '../components/Bookmarks';
import World from '../components/World';
import MainLayout from '../components/MainLayout';
import MCQScreen from '../components/MCQScreen';
import WCQscreen from '../components/WCQscreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0, // Android
            shadowOpacity: 0, // iOS
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTintColor: '#000000',
        }}>
        <Stack.Screen
          name="Home"
          options={{
            headerShown: false,
            headerTransparent: true,
          }}>
          {props => (
            <MainLayout showCategoryBar={false}>
              <HomeScreen {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="National MCQs"
          options={{
            headerShown: false,
            headerTransparent: true,
          }}>
          {props => (
            <MainLayout showCategoryBar={true}>
              <MCQScreen {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="World MCQs"
          options={{
            headerShown: false,
            headerTransparent: true,
          }}>
          {props => (
            <MainLayout showCategoryBar={true}>
              <WCQscreen {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="National"
          options={{
            headerShown: false,
            headerTransparent: true,
          }}>
          {props => (
            <MainLayout showCategoryBar={true}>
              <National {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen
          name="World"
          options={{
            headerShown: false,
            headerTransparent: true,
          }}>
          {props => (
            <MainLayout showCategoryBar={true}>
              <World {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Bookmarks" component={Bookmarks} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
