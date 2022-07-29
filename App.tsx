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

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

export const BACKGROUND_FETCH_SYNC = 'background-fetch-import';
TaskManager.defineTask(BACKGROUND_FETCH_SYNC, async () => {
    const now = Date.now();

    console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
});

export const BACKGROUND_THUMB_FETCH = 'background-thumb-fetch';
TaskManager.defineTask(BACKGROUND_THUMB_FETCH, async () => {
    const now = Date.now();

    console.log(`Thumb background fetch call at date: ${new Date(now).toISOString()}`);

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function unregisterBackgroundFetchAsync() {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_SYNC);
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_THUMB_FETCH);
}

export async function registerBackgroundFetchAsync() {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_SYNC, {
        minimumInterval: 60, // 15 minutes
        stopOnTerminate: false, // android only,
        startOnBoot: true, // android only
    });
    return BackgroundFetch.registerTaskAsync(BACKGROUND_THUMB_FETCH, {
        minimumInterval: 1, // 15 minutes
        stopOnTerminate: false, // android only,
        startOnBoot: true, // android only
    });
}


unregisterBackgroundFetchAsync()
registerBackgroundFetchAsync()


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
