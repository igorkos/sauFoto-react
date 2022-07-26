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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {useEffect} from "react";
import {getPlaceholderUri} from "./styles/Images";

export default function App() {
    useEffect( () => {
        getPlaceholderUri().then(r => {})
    })
  return (
          <GestureHandlerRootView style={{ flex: 1 }}>
                <Navigation/>
          </GestureHandlerRootView>
  );
};
