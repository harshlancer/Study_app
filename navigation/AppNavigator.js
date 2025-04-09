import React, { forwardRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WebViewScreen from '../components/WebViewScreen';
import SplashScreen from '../screens/SplashScreen';
import PDFViewerScreen from '../screens/PDFViewerScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ContactScreen from '../screens/ContactScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import CategoryTabNavigator from '../components/CategoryTabNavigator'; // New import
import MainLayout from '../components/MainLayout';

const Stack = createStackNavigator();

const AppNavigator = forwardRef((props, ref) => {
  return (
    <NavigationContainer ref={ref}>
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
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PDFViewer"
          component={PDFViewerScreen}
          options={({ route }) => ({ title: route.params.title || 'PDF Viewer' })}
        />
        <Stack.Screen
          name="Home"
          options={{ headerShown: false, headerTransparent: true }}
        >
          {(props) => (
            <MainLayout showCategoryBar={false}>
              <HomeScreen {...props} />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Categories"
          component={CategoryTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
          options={{ title: 'Privacy Policy' }}
        />
        <Stack.Screen
          name="AboutUsScreen"
          component={AboutUsScreen}
          options={{ title: 'About Us' }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactScreen}
          options={{ title: 'Contact Us' }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default AppNavigator;