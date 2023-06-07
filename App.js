import * as React from 'react';
import * as WebBrowser from 'expo-web-browser'; // [Expo WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session'; // [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
import {
  StyleSheet,
  Button } from 'react-native';

export default function App() {
  return (
    <Button
      title="Login">
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
