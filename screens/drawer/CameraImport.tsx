import * as React from "react";
import {photosListView} from "../compnents/PhotosCollectionList";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../styles/themes";
import {HeaderNavigationRight, NavigationDrawerBack} from "../compnents/DrawerButtons";
import {ServiceType} from "../../data/ServiceType";
import {ActionEvents} from "../types/ActionEvents";

const Stack = createNativeStackNavigator();

// @ts-ignore
export function CameraNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Screen  name="CameraImport" component={CameraScreen} options={{ headerShown: true,
                title:'Camera',
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerBack navigationProps={navigation}/>
                ),
                headerRight: () => (
                    <HeaderNavigationRight actions={[ActionEvents.selectAll,ActionEvents.importToGallery, ActionEvents.importToAlbum]}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}
// @ts-ignore
function CameraScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Camera, false, true)
}
