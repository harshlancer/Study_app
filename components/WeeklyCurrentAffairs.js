import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Linking, RefreshControl } from 'react-native';
import HTMLParser from 'react-native-html-parser';
import LoadingScreen from './LoadingScreen';

const WeeklyCurrentAffairs = () => {
  const [pdfList, setPdfList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const baseUrl = 'https://www.madeeasy.in/';
      const response = await fetch('https://www.madeeasy.in/weekly-current-affairs');
      const htmlText = await response.text();
      
      if (!htmlText || htmlText.trim() === '') {
        console.warn('Empty response from Made Easy');
        return;
      }
      
      try {
        const parser = new HTMLParser.DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        const jobsSection = doc.getElementsByClassName('re-jobs');
        if (!jobsSection.length) {
          console.warn('Could not find the re-jobs section');
          return;
        }
        
        const ulElements = jobsSection[0].getElementsByTagName('ul');
        const extractedPDFs = [];
        
        for (let i = 0; i < ulElements.length; i++) {
          try {
            const ul = ulElements[i];
            const liElements = ul.getElementsByTagName('li');
            
            if (liElements.length < 2) continue;
            
            // Get title from first li
            const title = liElements[0].textContent.trim();
            
            // Get PDF link from second li > a
            const aElement = liElements[1].getElementsByTagName('a')[0];
            if (!aElement) continue;
            
            const pdfRelativeUrl = aElement.getAttribute('href');
            const pdfFullUrl = baseUrl + pdfRelativeUrl;
            
            extractedPDFs.push({
              title,
              url: pdfFullUrl,
              date: title.match(/\(([^)]+)\)/)?.[1] || '',
            });
          } catch (itemError) {
            console.warn('Error parsing individual PDF item', itemError);
            continue;
          }
        }
        
        setPdfList(extractedPDFs);
      } catch (parseError) {
        console.error('Error parsing Made Easy HTML:', parseError);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handlePDFDownload = (url) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchPDFs();
  };
  
  if (loading && !refreshing) {
    return <LoadingScreen />;
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={pdfList}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0000ff']}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.pdfItem} 
            onPress={() => handlePDFDownload(item.url)}
          >
            <Text style={styles.pdfTitle}>{item.title}</Text>
            <Text style={styles.pdfDate}>{item.date}</Text>
            <View style={styles.downloadButton}>
              <Text style={styles.downloadText}>Download PDF</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdfItem: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pdfDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default WeeklyCurrentAffairs;