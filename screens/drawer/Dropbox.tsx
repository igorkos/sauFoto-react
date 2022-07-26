import * as React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../styles/themes";
import {
    HeaderNavigationRight,
    NavigationDrawerBack,
} from "../compnents/DrawerButtons";
import {ServiceType} from "../../data/ServiceType";
import {photosListView} from "../compnents/PhotosCollectionList";
import {ActionEvents} from "../types/ActionEvents";

const Stack = createNativeStackNavigator();
// @ts-ignore
export function DropboxNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="DropboxImages" component={DropboxScreen} options={{
                headerShown: true,
                title: "Dropbox",
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerBack navigationProps={navigation}/>
                ),
                headerRight: () => (
                    <HeaderNavigationRight actions={[ActionEvents.selectAll,ActionEvents.importToGallery, ActionEvents.importToAlbum]}/>
                ),
            }}/>
            <Stack.Screen name="DropboxAlbumImages" component={DropboxScreen} options={{
                headerShown: true,
                title: "Dropbox",
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerBack navigationProps={navigation}/>
                ),
                headerRight: () => (
                    // @ts-ignore
                    <NavigationDrawerRightImportImages navigationProps={navigation} type={ServiceType.Dropbox}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}
// @ts-ignore
function DropboxScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Dropbox, true, true)
}








