import * as React from "react";
import {theme} from "../constants/themes";
import {
    NavigationDrawerBack,
    NavigationDrawerLeft,
    NavigationDrawerRightImportImages
} from "../components/NavigationBar/DrawerButtons";
import {ServiceType} from "../data/ServiceType";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {photosListView} from "./drawer/PhotosCollectionList";

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
            }}/>
            <Stack.Screen name="SaufotoAlbumImages" component={AlbumImagesScreen} options={{
                headerShown: true,
                title: "",
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerBack navigationProps={navigation}/>
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
function AlbumImagesScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Saufoto, false, false)
}
