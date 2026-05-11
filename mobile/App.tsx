import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { dashboardHtml } from './src/dashboardHtml';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050506" />
      <WebView
        originWhitelist={['*']}
        source={{ html: dashboardHtml, baseUrl: 'https://localhost' }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        textZoom={100}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050506' },
  webview: { flex: 1, backgroundColor: '#050506' },
});
