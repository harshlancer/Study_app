// components/CustomDrawerContent.js
import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const CustomDrawerContent = ({navigation}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1E1E1E']}
        style={styles.gradient}
      />
      
      <View style={styles.header}>
        <Image
          source={require('./image.png')} // Replace with your logo
          style={styles.logo}
        />
        <Text style={styles.appName}>Editorial</Text>
      </View>

      <View style={styles.drawerItems}>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Main')}>
          <Icon name="home" size={24} color="#FFFFFF" />
          <Text style={styles.drawerItemText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Icon name="shield-lock" size={24} color="#FFFFFF" />
          <Text style={styles.drawerItemText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Contact')}>
          <Icon name="email" size={24} color="#FFFFFF" />
          <Text style={styles.drawerItemText}>Contact Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('AboutUs')}>
          <Icon name="information" size={24} color="#FFFFFF" />
          <Text style={styles.drawerItemText}>About Us</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  footerText: {
    color: '#AAAAAA',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CustomDrawerContent;