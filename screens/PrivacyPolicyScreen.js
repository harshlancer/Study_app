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
          We collect information to provide better services to all our users. 
          The types of information we collect depend on how you use our services.
        </Text>
        
        <Text style={styles.sectionTitle}>2. How We Use Information</Text>
        <Text style={styles.text}>
          We use the information we collect to provide, maintain, and improve 
          our services, to develop new ones, and to protect our users.
        </Text>
        
        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.text}>
          We do not share personal information with companies, organizations, 
          or individuals outside of our company except in the following cases:
        </Text>
        <Text style={styles.listItem}>• With your consent</Text>
        <Text style={styles.listItem}>• For legal reasons</Text>
        
        <Text style={styles.sectionTitle}>4. Security</Text>
        <Text style={styles.text}>
          We work hard to protect our users from unauthorized access to or 
          alteration, disclosure, or destruction of information we hold.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may change this privacy policy from time to time. We will post 
          any privacy policy changes on this page.
        </Text>
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