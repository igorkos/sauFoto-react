/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import 'localstorage-polyfill';
import Navigation from './navigation';
import SaufotoContext from './data/SaufotoImage';
const {RealmProvider} = SaufotoContext;
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
      <RealmProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
                <Navigation/>
          </GestureHandlerRootView>
      </RealmProvider>

  );
};

