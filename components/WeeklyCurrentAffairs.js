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
  StatusBar,
  Animated,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import HTMLParser from 'react-native-html-parser';
import LoadingScreen from './LoadingScreen';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';

const {width, height} = Dimensions.get('window');

const WeeklyCurrentAffairs = () => {
  const [pdfList, setPdfList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoadProgress, setPdfLoadProgress] = useState(0);
  const [offlinePdfs, setOfflinePdfs] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const fullScreenAnim = useRef(new Animated.Value(0)).current;

  // Add a timeout reference to force complete loading
  const loadingTimeoutRef = useRef(null);
  // Track PDF component mount state
  const pdfMounted = useRef(false);

  // Load offline PDFs from AsyncStorage on component mount
  useEffect(() => {
    fetchPDFs();
    loadOfflinePdfs();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Clean up any timeouts when component unmounts
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      pdfMounted.current = false;
    };
  }, []);

  // Load cached PDF information from AsyncStorage
  const loadOfflinePdfs = async () => {
    try {
      const cachedPdfs = await AsyncStorage.getItem('offline_pdfs');
      if (cachedPdfs) {
        const parsedData = JSON.parse(cachedPdfs);
        setOfflinePdfs(parsedData);
        console.log('Loaded offline PDFs:', Object.keys(parsedData).length);
      }
    } catch (error) {
      console.error('Error loading offline PDFs:', error);
    }
  };

  // Save PDF information to AsyncStorage
  const saveOfflinePdfs = async updatedPdfs => {
    try {
      await AsyncStorage.setItem('offline_pdfs', JSON.stringify(updatedPdfs));
      setOfflinePdfs(updatedPdfs);
    } catch (error) {
      console.error('Error saving offline PDFs:', error);
    }
  };

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
    // Check if we have this PDF cached locally
    const localPath = offlinePdfs[url];
    setSelectedPdf(localPath || url);
    setModalVisible(true);
    setPdfLoading(true);
    setPdfError(null);
    setPdfLoadProgress(0);
    pdfMounted.current = true;

    // Animation for modal
    modalSlideAnim.setValue(0);
    Animated.timing(modalSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Set a hard timeout to force complete loading after 12 seconds
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      if (pdfMounted.current && pdfLoading) {
        console.log('Forcing PDF loading completion via timeout');
        setPdfLoading(false);
      }
    }, 12000); // 12 second timeout

    console.log('Viewing PDF from:', localPath ? 'local storage' : 'network');
  };

  // Force hide loading if progress is high enough
  useEffect(() => {
    if (pdfLoadProgress >= 0.85 && pdfMounted.current) {
      // If we reach 85% or higher, give it a short moment then hide the loader
      const timer = setTimeout(() => {
        setPdfLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [pdfLoadProgress]);

  // Request storage permissions (For Android)
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download PDF files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting storage permission:', err);
      return false;
    }
  };

  // Download PDF to device storage
  const handlePDFDownload = async url => {
    // Don't proceed if already downloading
    if (isDownloading) {
      Alert.alert(
        'Download in Progress',
        'Please wait for the current download to complete',
      );
      return;
    }

    // If we already have this PDF stored locally, no need to download again
    if (offlinePdfs[url]) {
      Alert.alert(
        'PDF Already Downloaded',
        'This PDF is already saved on your device',
      );
      return;
    }

    // Check permissions on Android
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download PDFs',
      );
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    // Extract filename from URL or create one
    const timestamp = new Date().getTime();
    const filename = `weekly-current-affairs-${timestamp}.pdf`;

    // Get the directory for storing PDFs
    const {dirs} = RNFetchBlob.fs;
    let downloadPath;

    if (Platform.OS === 'ios') {
      downloadPath = `${dirs.DocumentDir}/${filename}`;
    } else {
      downloadPath = `${dirs.DownloadDir}/${filename}`;
    }

    try {
      const response = await RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: downloadPath,
          description: 'Downloading PDF',
          mediaScannable: true,
        },
        path: downloadPath,
        indicator: true,
        IOSBackgroundTask: true,
      })
        .fetch('GET', url)
        .progress((received, total) => {
          const progress = received / total;
          setDownloadProgress(progress);
        });

      console.log('PDF downloaded to:', response.path());

      // Add to offline PDFs
      const updatedOfflinePdfs = {
        ...offlinePdfs,
        [url]:
          Platform.OS === 'android'
            ? `file://${response.path()}`
            : response.path(),
      };

      await saveOfflinePdfs(updatedOfflinePdfs);

      Alert.alert('Download Complete', 'PDF has been saved to your device', [
        {text: 'OK'},
      ]);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', 'There was a problem downloading the PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPDFs();
  };

  // Toggle full-screen mode
  const toggleFullScreen = () => {
    Animated.timing(fullScreenAnim, {
      toValue: isFullScreen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFullScreen(!isFullScreen);
  };

  // Component cleanup when modal closes
  const handleCloseModal = () => {
    // Animation for closing
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setPdfLoading(false);
      setPdfError(null);
      pdfMounted.current = false;
      setIsFullScreen(false);
    });

    // Clear any pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const handlePdfLoadComplete = (numberOfPages, filePath) => {
    console.log(`PDF loaded successfully with ${numberOfPages} pages`);
    if (pdfMounted.current) {
      setPdfLoading(false);
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const handlePdfError = error => {
    console.error('PDF Error:', error);
    if (pdfMounted.current) {
      setPdfError(error.toString());
      setPdfLoading(false);

      // Show error alert to user
      Alert.alert(
        'PDF Error',
        'There was a problem loading the PDF. Try downloading it instead.',
        [
          {
            text: 'Download',
            onPress: () => selectedPdf && handlePDFDownload(selectedPdf),
          },
          {text: 'Close', onPress: () => handleCloseModal(), style: 'cancel'},
        ],
      );
    }
  };

  const handlePdfLoadProgress = percentage => {
    console.log(`Loading PDF: ${(percentage * 100).toFixed(1)}%`);
    if (pdfMounted.current) {
      setPdfLoadProgress(percentage);
    }
  };

  if (loading && !refreshing) {
    return <LoadingScreen />;
  }

  const modalTranslateY = modalSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const headerOpacity = fullScreenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const controlsOpacity = fullScreenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      <LinearGradient colors={['#121212', '#1E1E1E']} style={styles.gradient} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Current Affairs</Text>
        <Text style={styles.subtitle}>Latest PDF updates</Text>
      </View>

      {/* Accent circles for matching HomeScreen */}

      <Animated.View style={{flex: 1, opacity: fadeAnim}}>
        <FlatList
          data={pdfList}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
              progressBackgroundColor="#1E1E1E"
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.pdfItem}
              onPress={() => handlePDFView(item.url)}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#1E1E1E', '#2F2F2F']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.itemGradient}>
                <View style={styles.iconContainer}>
                  <Icon name="file-pdf-box" size={24} color="#FF5722" />
                  {offlinePdfs[item.url] && (
                    <View style={styles.offlineBadge}>
                      <Icon name="check" size={10} color="#FFF" />
                    </View>
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.pdfTitle}>{item.title}</Text>
                  <Text style={styles.pdfDate}>{item.date}</Text>
                  {offlinePdfs[item.url] && (
                    <Text style={styles.savedText}>Saved offline</Text>
                  )}
                </View>
                <Icon name="chevron-right" size={22} color="#BBBBBB" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="emoticon-sad-outline" size={50} color="#888" />
              <Text style={styles.emptyText}>
                No PDF files found. Pull down to refresh.
              </Text>
            </View>
          }
        />
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {transform: [{translateY: modalTranslateY}]},
            ]}>
            <LinearGradient
              colors={['#1E1E1E', '#121212']}
              style={styles.modalGradient}>
              <Animated.View
                style={[styles.modalHeader, {opacity: headerOpacity}]}>
                <Text style={styles.modalTitle}>PDF Viewer</Text>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={handleCloseModal}>
                  <Icon name="close" size={22} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.pdfContainer}>
                {selectedPdf && (
                  <Pdf
                    source={{
                      uri: selectedPdf,
                      cache: true,
                      headers: {
                        Accept: 'application/pdf',
                      },
                    }}
                    style={[styles.pdf, isFullScreen && styles.fullScreenPdf]}
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
                    // Important: Don't render its own activity indicator
                    renderActivityIndicator={() => null}
                  />
                )}

                {pdfLoading && (
                  <View style={styles.pdfLoadingContainer}>
                    <View style={styles.loaderCard}>
                      <ActivityIndicator size="large" color="#2196F3" />
                      <Text style={styles.loadingText}>
                        Loading PDF
                        {pdfLoadProgress > 0
                          ? ` (${Math.round(pdfLoadProgress * 100)}%)`
                          : '...'}
                      </Text>
                      {pdfLoadProgress > 0.7 && (
                        <TouchableOpacity
                          style={styles.skipButton}
                          onPress={() => setPdfLoading(false)}>
                          <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {pdfError && (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={40} color="#E57373" />
                    <Text style={styles.errorText}>Failed to load PDF</Text>
                    <Text style={styles.errorSubtext}>
                      {pdfError.substring(0, 100)}
                    </Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => {
                        setPdfError(null);
                        setPdfLoading(true);
                        // Force a re-render
                        const currentPdf = selectedPdf;
                        setSelectedPdf(null);
                        setTimeout(() => setSelectedPdf(currentPdf), 100);
                      }}>
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Floating fullscreen button */}
                {!pdfLoading && !pdfError && (
                  <TouchableOpacity
                    style={[
                      styles.fullScreenButton,
                      isFullScreen && styles.fullScreenExitButton,
                    ]}
                    onPress={toggleFullScreen}>
                    <Icon
                      name={isFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                      size={22}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Animated.View
                style={[
                  styles.modalButtonContainer,
                  {opacity: controlsOpacity},
                ]}>
                <TouchableOpacity
                  style={[
                    styles.downloadButton,
                    isDownloading && styles.downloadingButton,
                  ]}
                  onPress={() => selectedPdf && handlePDFDownload(selectedPdf)}
                  disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#FFF"
                        style={styles.downloadingIcon}
                      />
                      <Text style={styles.buttonText}>
                        Downloading {Math.round(downloadProgress * 100)}%
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon name="download" size={20} color="#FFF" />
                      <Text style={styles.buttonText}>Save PDF</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',

  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 16,
    marginTop: 5,
    fontWeight: '400',
  },
  accentCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFFFFF10',
    top: -150,
    right: -100,
    zIndex : -10,

  },
  accentCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#C6C0BE10',
    bottom: -50,
    left: -50,
    zIndex: -10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pdfItem: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  itemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  offlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#121212',
  },
  textContainer: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  pdfDate: {
    fontSize: 14,
    color: '#BBB',
  },
  savedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '94%',
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
  },
  modalGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#252525',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#252525',
  },
  fullScreenPdf: {
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  fullScreenButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  fullScreenExitButton: {
    top: 40,
  },
  pdfLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(25,25,25,0.8)',
    zIndex: 3,
  },
  loaderCard: {
    backgroundColor: 'rgba(30,30,30,0.9)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: width * 0.8,
    elevation: 4,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(25,25,25,0.9)',
    padding: 20,
    zIndex: 3,
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E57373',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadingButton: {
    backgroundColor: '#1565C0',
  },
  downloadingIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default WeeklyCurrentAffairs;
