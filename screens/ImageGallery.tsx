import * as React from 'react';
import {photosListView} from "./drawer/PhotosCollectionList";
import {ServiceType} from "../data/ServiceType";
import {theme} from "../constants/themes";
import {NavigationDrawerBack, NavigationDrawerLeft} from "../components/NavigationBar/DrawerButtons";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

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
                }}/>
            </Stack.Group>
        </Stack.Navigator>
    );

}

/*
<Stack.Group screenOptions={{presentation: 'modal', headerShown: true,}}>

 */
// @ts-ignore
function SaufotoGalleryScreen({ navigation, route }){
    return  photosListView(navigation, route, ServiceType.Saufoto, false, false, false)
}
// @ts-ignore
export function SaufotoGalleryPreviewScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Saufoto, false, false, true)
}
