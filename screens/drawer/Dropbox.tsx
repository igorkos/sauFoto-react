import * as React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../constants/themes";
import {NavigationDrawerBack, NavigationDrawerRightImportImages} from "../../components/NavigationBar/DrawerButtons";
import {ServiceType} from "../../data/ServiceType";
import {photosListView} from "./PhotosCollectionList";

const Stack = createNativeStackNavigator();

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
                    <NavigationDrawerRightImportImages navigationProps={navigation} type={ServiceType.Dropbox}/>
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
                    <NavigationDrawerRightImportImages navigationProps={navigation} type={ServiceType.Dropbox}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}

function DropboxScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Dropbox, true)
}








