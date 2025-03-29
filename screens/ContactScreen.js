// screens/ContactScreen.js
import React from 'react';
import {View, Text, StyleSheet, Linking, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ContactScreen = ({navigation}) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:support@editorialapp.com');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.editorialapp.com');
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <Text style={styles.title}>We'd love to hear from you!</Text>
        
        <View style={styles.contactCard}>
          <Icon name="email" size={24} color="#5D5DFB" />
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.contactText}>support@editorialapp.com</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactCard}>
          <Icon name="web" size={24} color="#5D5DFB" />
          <TouchableOpacity onPress={handleWebsitePress}>
            <Text style={styles.contactText}>www.editorialapp.com</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactCard}>
          <Icon name="twitter" size={24} color="#5D5DFB" />
          <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/editorialapp')}>
            <Text style={styles.contactText}>@editorialapp</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.feedbackText}>
          Your feedback helps us improve the app. Please don't hesitate to reach out with any questions, suggestions, or issues.
        </Text>
      </View>
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
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#121212',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#5D5DFB',
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 30,
    color: '#666666',
  },
});

export default ContactScreen;