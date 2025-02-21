import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewScreen = ({ route }) => {
  const { url } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <WebView 
        source={{ uri: url }} 
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" color="blue" />}
      />
    </View>
  );
};

export default WebViewScreen;
