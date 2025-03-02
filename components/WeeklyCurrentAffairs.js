import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import HTMLParser from 'react-native-html-parser';
import LoadingScreen from './LoadingScreen';
import Pdf from 'react-native-pdf';

const WeeklyCurrentAffairs = () => {
  const [pdfList, setPdfList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoadProgress, setPdfLoadProgress] = useState(0);

  // Add a timeout reference to force complete loading
  const loadingTimeoutRef = useRef(null);
  // Track PDF component mount state
  const pdfMounted = useRef(false);

  useEffect(() => {
    fetchPDFs();

    // Clean up any timeouts when component unmounts
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      pdfMounted.current = false;
    };
  }, []);

  const fetchPDFs = async () => {
    try {
      if (!refreshing) setLoading(true);

      const baseUrl = 'https://www.madeeasy.in/';
      const response = await fetch(
        'https://www.madeeasy.in/weekly-current-affairs',
      );
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

  const handlePDFView = url => {
    setSelectedPdf(url);
    setModalVisible(true);
    setPdfLoading(true);
    setPdfError(null);
    setPdfLoadProgress(0);
    pdfMounted.current = true;

    // Set a hard timeout to force complete loading after 15 seconds
    // This is a fallback in case none of the events fire
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      if (pdfMounted.current && pdfLoading) {
        console.log('Forcing PDF loading completion via timeout - no events detected');
        setPdfLoading(false);
      }
    }, 15000); // 15 second timeout as a hard limit
  };

  // Force hide loading if progress is high enough
  useEffect(() => {
    if (pdfLoadProgress >= 0.8 && pdfMounted.current) {
      // If we reach 80% or higher, give it a second then hide the loader
      const timer = setTimeout(() => {
        setPdfLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pdfLoadProgress]);

  const handlePDFDownload = url => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Could not open PDF for download.');
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPDFs();
  };

  // Component cleanup when modal closes
  const handleCloseModal = () => {
    setModalVisible(false);
    setPdfLoading(false);
    setPdfError(null);
    pdfMounted.current = false;

    // Clear any pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // Give a short delay before clearing the PDF to prevent visual glitches
    setTimeout(() => {
      setSelectedPdf(null);
    }, 300);
  };

  const handlePdfLoadComplete = (numberOfPages, filePath) => {
    console.log(`PDF loaded successfully with ${numberOfPages} pages`);
    if (pdfMounted.current) {
      setPdfLoading(false);
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const handlePdfError = (error) => {
    console.error('PDF Error:', error);
    if (pdfMounted.current) {
      setPdfError(error.toString());
      setPdfLoading(false);
      
      // Show error alert to user
      Alert.alert(
        'PDF Error',
        'There was a problem loading the PDF. Try downloading it instead.',
        [
          {text: 'Download', onPress: () => selectedPdf && handlePDFDownload(selectedPdf)},
          {text: 'Close', onPress: () => handleCloseModal(), style: 'cancel'},
        ]
      );
    }
  };

  const handlePdfLoadProgress = (percentage) => {
    console.log(`Loading PDF: ${(percentage * 100).toFixed(1)}%`);
    if (pdfMounted.current) {
      setPdfLoadProgress(percentage);
    }
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
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.pdfItem}
            onPress={() => handlePDFView(item.url)}>
            <Text style={styles.pdfTitle}>{item.title}</Text>
            <Text style={styles.pdfDate}>{item.date}</Text>
            <View style={styles.downloadButton}>
              <Text style={styles.downloadText}>View PDF</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No PDF files found. Pull down to refresh.</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          {selectedPdf && (
            <Pdf
              source={{
                uri: selectedPdf,
                cache: true,
                headers: {
                  Accept: 'application/pdf',
                },
              }}
              style={styles.pdf}
              onLoadComplete={handlePdfLoadComplete}
              onPageChanged={(page, totalPages) => {
                console.log(`Current page: ${page}/${totalPages}`);
              }}
              onError={handlePdfError}
              onLoadProgress={handlePdfLoadProgress}
              trustAllCerts={Platform.OS === 'android' ? false : true}
              enableAntialiasing={true}
              maxRetry={3}
              retryTimeout={5000}
              // Fallback options on Android
              renderActivityIndicator={() => (
                <ActivityIndicator size="large" color="#FF5722" />
              )}
              activityIndicatorProps={{color: '#FF5722', progressTintColor: '#FF5722'}}
            />
          )}

          {pdfLoading && (
            <View style={styles.pdfLoadingContainer}>
              <ActivityIndicator size="large" color="#FF5722" />
              <Text style={styles.loadingText}>
                Loading PDF...{' '}
                {pdfLoadProgress > 0
                  ? `${Math.round(pdfLoadProgress * 100)}%`
                  : ''}
              </Text>
              {pdfLoadProgress > 0.7 && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => setPdfLoading(false)}>
                  <Text style={styles.skipButtonText}>Skip Loading</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {pdfError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error loading PDF: {pdfError}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setPdfError(null);
                  setPdfLoading(true);
                  setPdfLoadProgress(0);
                  // Force a re-render by briefly clearing and resetting the PDF URL
                  const currentPdf = selectedPdf;
                  setSelectedPdf(null);
                  setTimeout(() => setSelectedPdf(currentPdf), 100);
                }}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => selectedPdf && handlePDFDownload(selectedPdf)}>
              <Text style={styles.modalButtonText}>Download PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={handleCloseModal}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    shadowOffset: {width: 0, height: 1},
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  pdfLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  skipButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#757575',
    borderRadius: 5,
  },
  skipButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#757575',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default WeeklyCurrentAffairs;