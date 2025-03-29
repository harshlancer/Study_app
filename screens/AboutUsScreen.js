// screens/AboutUsScreen.js
import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';

const AboutUsScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('./image.png')} // Replace with your logo
          style={styles.logo}
        />
        
        <Text style={styles.title}>About Editorial</Text>
        
        <Text style={styles.text}>
          Editorial is a comprehensive current affairs application designed to 
          keep you informed about national and international events, with 
          special focus on competitive exam preparation.
        </Text>
        
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.text}>
          To provide accurate, timely, and relevant information in an 
          accessible format that helps users stay informed and excel in 
          their competitive examinations.
        </Text>
        
        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.listItem}>• Daily current affairs updates</Text>
        <Text style={styles.listItem}>• Comprehensive MCQ sections</Text>
        <Text style={styles.listItem}>• Weekly current affairs summaries</Text>
        <Text style={styles.listItem}>• Bookmarking for important news</Text>
        
        <Text style={styles.sectionTitle}>The Team</Text>
        <Text style={styles.text}>
          Our team consists of experienced educators, content creators, and 
          developers passionate about making quality education accessible to all.
        </Text>
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#121212',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#333333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#121212',
    textAlign: 'center',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
    color: '#333333',
  },
  version: {
    fontSize: 14,
    color: '#666666',
    marginTop: 30,
  },
});

export default AboutUsScreen;