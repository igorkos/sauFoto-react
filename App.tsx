/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import {StatusBar, useColorScheme,} from 'react-native';
import 'localstorage-polyfill';
import Navigation from './navigation';
import { Provider as PaperProvider } from 'react-native-paper';
import {theme} from "./constants/themes";

export default function App() {
  return (
      <PaperProvider theme={theme}>
        <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'dark-content' : 'light-content'} />
        <Navigation/>
      </PaperProvider>
  );
};

