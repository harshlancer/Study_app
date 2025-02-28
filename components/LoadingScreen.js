import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, StatusBar} from 'react-native';
import fetchQuotes from './fetchQuotes'; // Import the fetchQuotes function

const LoadingScreen = () => {
  const [quote, setQuote] = useState('');
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const quotes = await fetchQuotes(); // Fetch quotes
        if (quotes.length > 0) {
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]; // Pick a random quote
          setQuote(randomQuote);
        } else {
          setQuote('No quotes available.'); // Fallback if no quotes are fetched
        }
      } catch (error) {
        console.error('Error loading quotes:', error);
        setQuote('Failed to load quotes.'); // Fallback if there's an error
      } finally {
        setLoadingQuotes(false); // Stop loading
      }
    };

    loadQuote();
  }, []); // Empty dependency array ensures this runs only once when the screen loads

  return (
    <View style={styles.container}>
      <StatusBar color="#FF5722" barStyle="dark-content" />
      {/* Loading Spinner */}
      <ActivityIndicator size="large" color="#FF5722" />
      {/* Quote Display */}

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  quoteContainer: {
    marginTop: 20, // Add some spacing between the spinner and the quote
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#333',
  },
});

export default LoadingScreen;
