// screens/PrivacyPolicyScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const PrivacyPolicyScreen = ({ navigation }) => {
  const openWebsite = () => {
    Linking.openURL('https://privacy-peach-xi.vercel.app/');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.linkButton} onPress={openWebsite}>
        <Text style={styles.linkText}>🔗 Press here for the website view</Text>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: [Date]</Text>
        
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We don't collect any information to provide services to all our users. 
        </Text>
        
        <Text style={styles.sectionTitle}></Text>
        <Text style={styles.text}>
        </Text>
        
        <Text style={styles.sectionTitle}></Text>
        <Text style={styles.text}>
        </Text>
        
        
        
        <Text style={styles.sectionTitle}>5. Changes to This Policy</Text>
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  linkButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#121212',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#121212',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: '#333333',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 15,
    color: '#333333',
  },
});

export default PrivacyPolicyScreen;