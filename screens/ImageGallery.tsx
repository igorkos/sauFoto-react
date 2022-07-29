import * as React from 'react';
import {photosListView} from "./compnents/PhotosCollectionList";
import {ServiceType} from "../data/ServiceType";
import {theme} from "../styles/themes";
import {HeaderNavigationRight, NavigationDrawerLeft} from "./compnents/DrawerButtons";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {ActionEvents} from "./types/ActionEvents";
import {useEffect} from "react";
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import {BackgroundFetchStatus} from "expo-background-fetch/src/BackgroundFetch.types";
import {BACKGROUND_FETCH_SYNC, registerBackgroundFetchAsync, unregisterBackgroundFetchAsync} from "../App";
import {Log} from "../utils/log";

const Stack = createNativeStackNavigator();
// @ts-ignore
export function GalleryImagesNavigator({navigation}) {
    const [isRegistered, setIsRegistered] = React.useState(false);
    const [status, setStatus] = React.useState<BackgroundFetchStatus | null>(null);

    const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_SYNC);
        Log.debug("!!!!!! Async Task registered " + isRegistered)
        setStatus(status);
        setIsRegistered(isRegistered);
    };

    useEffect(() => {
        checkStatusAsync().then(r => {});
    }, []);

    useEffect(() => {
        if (!isRegistered) {
            registerBackgroundFetchAsync().then(r => {});
        }
    }, [isRegistered]);

    return (
        <Stack.Navigator>
            <Stack.Group>
                <Stack.Screen name="SaufotoImages" component={SaufotoGalleryScreen} options={{
                    headerShown: true,
                    title: "Gallery",
                    headerStyle: {backgroundColor: theme.colors.headerBackground,},
                    headerTintColor: theme.colors.text,
                    headerLeft: () => (
                        <NavigationDrawerLeft navigationProps={navigation} />
                    ),
                    headerRight: () => (
                        <HeaderNavigationRight actions={[ActionEvents.selectImages]}/>
                    ),
                }}/>
            </Stack.Group>
        </Stack.Navigator>
    );

}

// @ts-ignore
function SaufotoGalleryScreen({ navigation, route }){
    return  photosListView(navigation, route, ServiceType.Saufoto, false, false, false)
}
// @ts-ignore
export function SaufotoGalleryPreviewScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Saufoto, false, false, true)
}
