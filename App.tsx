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
import {enableScreens} from "react-native-screens";

global.__reanimatedWorkletInit = () => {};

enableScreens();

export default function App() {
  return (
      <Navigation/>
  );
};

