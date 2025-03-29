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
import SplashScreen from '../screens/SplashScreen';
import WeeklyCurrentAffairs from '../components/WeeklyCurrentAffairs';
import PDFViewerScreen from '../screens/PDFViewerScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ContactScreen from '../screens/ContactScreen';
import AboutUsScreen from '../screens/AboutUsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTintColor: '#000000',
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PDFViewer"
          component={PDFViewerScreen}
          options={({route}) => ({title: route.params.title || 'PDF Viewer'})}
        />
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
        <Stack.Screen 
          name="WebViewScreen" 
          component={WebViewScreen} 
        />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
          options={{title: 'Privacy Policy'}}
        />
        <Stack.Screen
          name="AboutUsScreen"
          component={AboutUsScreen}
          options={{title: 'About Us'}}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactScreen}
          options={{title: 'Contact Us'}}
        />
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
        <Stack.Screen
          name="WeeklyCurrentAffairs"
          options={{
            headerShown: false,
            headerTransparent: true,
          }}>
          {props => (
            <MainLayout showCategoryBar={true}>
              <WeeklyCurrentAffairs {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="Bookmarks" 
          component={Bookmarks} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;