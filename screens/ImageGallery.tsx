import * as React from 'react';
import {photosListView} from "./compnents/PhotosCollectionList";
import {ServiceType} from "../data/ServiceType";
import {theme} from "../styles/themes";
import {HeaderNavigationRight, NavigationDrawerLeft} from "./compnents/DrawerButtons";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {ActionEvents} from "./types/ActionEvents";

const Stack = createNativeStackNavigator();
// @ts-ignore
export function GalleryImagesNavigator({navigation}) {
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
