import * as React from "react";
import {photosListView} from "./PhotosCollectionList";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../constants/themes";
import {NavigationDrawerBack, NavigationDrawerRightImportImages} from "../../components/NavigationBar/DrawerButtons";
import {ServiceType} from "../../data/ServiceType";

const Stack = createNativeStackNavigator();

// @ts-ignore
export function CameraNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Screen  name="Camera" component={CameraScreen} options={{ headerShown: true,
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerBack navigationProps={navigation}/>
                ),
                headerRight: () => (
                    // @ts-ignore
                    <NavigationDrawerRightImportImages navigationProps={navigation} type={ServiceType.Camera}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}
// @ts-ignore
function CameraScreen({ navigation, route }) {
    return photosListView(navigation, route, ServiceType.Camera, false, true)
}
