/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
//import type {Node} from 'react';
import {NativeBaseProvider, extendTheme} from 'native-base';
import { Provider as PaperProvider } from 'react-native-paper';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import 'localstorage-polyfill';
import Navigation from './navigation';
import {enableScreens} from "react-native-screens";

global.__reanimatedWorkletInit = () => {};

enableScreens();

export default function App() {
  return (
      <PaperProvider>
        <Navigation colorScheme={useColorScheme()} />
      </PaperProvider>
  );
};

