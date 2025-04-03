import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Dirs, FileSystem } from 'react-native-file-access';
const PDFViewerScreen = ({ route, navigation }) => {
  const { pdfUrl, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [localPdfPath, setLocalPdfPath] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);

  useEffect(() => {
    if (title) {
      navigation.setOptions({ title: title });
    }
    loadPdf();
  }, []);

  const getPdfFileName = (url) => {
    // Extract file name from URL or create one based on title
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1] || `${encodeURIComponent(title)}.pdf`;
  };

  const getLocalPdfDir = async () => {
    const dir = `${Dirs.DocumentDir}/pdfs`; // Updated directory path
    try {
      const dirExists = await FileSystem.exists(dir); // Correct exists method
      if (!dirExists) {
        await FileSystem.mkdir(dir); // Correct mkdir method
      }
      return dir;
    } catch (error) {
      console.error('Error checking/creating directory:', error);
      throw error;
    }
  };
  
  const loadPdf = async () => {
    try {
      setLoading(true);
      const pdfFileName = getPdfFileName(pdfUrl);
      const pdfDir = await getLocalPdfDir();
      const localPath = `${pdfDir}/${pdfFileName}`;
      
      // Check if file exists using FileSystem
      const fileExists = await FileSystem.exists(localPath); // Updated here
      
      if (fileExists) {
        setLocalPdfPath(localPath);
        setLoading(false);
      } else {
        await downloadPdf(pdfUrl, localPath);
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      setDownloadFailed(true);
      setLoading(false);
    }
  };
  const downloadPdf = async (url, localPath) => {
    try {
      setDownloading(true);
      
      let options = {
        fileCache: true,
        path: localPath,
        indicator: true,
        IOSBackgroundTask: true,
        progress: (received, total) => {
          const percentage = Math.floor((received / total) * 100);
          setDownloadProgress(percentage);
        },
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: false,
          path: localPath,
          description: 'Downloading PDF'
        }
      };

      // Stream the PDF
      const res = await ReactNativeBlobUtil.config(options).fetch('GET', url);
      
      if (res.info().status === 200) {
        setLocalPdfPath(localPath);
        setDownloading(false);
        setLoading(false);
      } else {
        throw new Error('Failed to download PDF, status: ' + res.info().status);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setDownloading(false);
      setDownloadFailed(true);
      setLoading(false);
    }
  };

  const saveToDownloads = async () => {
    if (!localPdfPath) return;
    
    try {
      const pdfFileName = getPdfFileName(pdfUrl);
      
      // For Android, use Download Manager
      if (Platform.OS === 'android') {
        const downloadDest = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${pdfFileName}`;
        
        await ReactNativeBlobUtil.config({
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            title: pdfFileName,
            description: 'Downloading PDF file',
            mime: 'application/pdf',
            mediaScannable: true,
            notification: true,
            path: downloadDest,
          },
        })
        .fetch('GET', localPdfPath)
        .then(() => {
          Alert.alert('Success', 'PDF has been saved to your downloads folder');
        });
      } 
      // For iOS, use the share sheet
      else {
        await ReactNativeBlobUtil.ios.openDocument(localPdfPath);
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      Alert.alert('Error', 'Failed to save PDF to downloads');
    }
  };

  const retryDownload = () => {
    setDownloadFailed(false);
    loadPdf();
  };

  return (
    <View style={styles.container}>
      {loading || downloading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          {downloading && (
            <Text style={styles.progressText}>Downloading: {downloadProgress}%</Text>
          )}
        </View>
      ) : downloadFailed ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load PDF</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryDownload}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Pdf
            source={{ uri: Platform.OS === 'ios' ? localPdfPath : `file://${localPdfPath}` }}
            onLoadComplete={(numberOfPages, filePath) => {
            }}
            onPageChanged={(page, numberOfPages) => {
            }}
            onError={(error) => {
              console.error('Error loading PDF:', error);
              setDownloadFailed(true);
            }}
            style={styles.pdf}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveToDownloads}>
            <Text style={styles.saveText}>Save to Downloads</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF5722',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PDFViewerScreen;
