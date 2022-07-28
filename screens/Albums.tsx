import * as React from "react";
import {theme} from "../styles/themes";
import {
    HeaderNavigationRight,
    NavigationDrawerLeft,
} from "./compnents/DrawerButtons";
import {ServiceType} from "../data/ServiceType";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {photosListView} from "./compnents/PhotosCollectionList";
import {ActionEvents} from "./types/ActionEvents";

const Stack = createNativeStackNavigator();

// @ts-ignore
export function GalleryAlbumsNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="SaufotoAlbums" component={AlbumsScreen} options={{
                headerShown: true,
                title: "Albums",
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerLeft navigationProps={navigation} />
                ),
                headerRight: () => (
                    <HeaderNavigationRight actions={[ActionEvents.addAlbum]}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}

// @ts-ignore
function AlbumsScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Saufoto, true, false)
}

// @ts-ignore
export function AlbumImagesScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Saufoto, false, false)
}

// @ts-ignore
export function AlbumAddImagesScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Saufoto, false, true)
}
