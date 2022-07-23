import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {RootStackParamList, RootTabParamList} from "../screens/drawer/types";
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import * as React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CameraScreen from "../screens/Camera";
import {theme} from "../constants/themes";
import {GalleryAlbumsNavigator} from "../screens/Albums";
import {NavigationDrawerBack, NavigationDrawerLeft} from "../components/NavigationBar/DrawerButtons";
import {GalleryImagesNavigator, SaufotoGalleryPreviewScreen} from "../screens/ImageGallery";
import { ColorValue } from "react-native";
import {useLayoutEffect} from "react";

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const Stack = createNativeStackNavigator();
// @ts-ignore
export function RootNavigator({navigation}) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerShown: false,
            }}>
            <Stack.Group screenOptions={{presentation: 'modal'}}>
                <Stack.Screen name="Home" component={BottomTabNavigator} options={{
                    title: "Gallery",
                    headerStyle: {backgroundColor: theme.colors.headerBackground,},
                    headerTintColor: theme.colors.text,
                    headerLeft: () => (
                        <NavigationDrawerLeft navigationProps={navigation}/>
                    ),
                }}/>
            </Stack.Group>
            <Stack.Group screenOptions={{presentation: 'modal'}}>
                <Stack.Screen name="PreviewImages" component={SaufotoGalleryPreviewScreen} options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {backgroundColor: theme.colors.headerBackground,},
                    headerTintColor: theme.colors.text,
                    headerLeft: () => (
                        <NavigationDrawerBack navigationProps={navigation}/>
                    ),
                }}/>
            </Stack.Group>
        </Stack.Navigator>
    );
}

const BottomTab = createBottomTabNavigator<RootTabParamList>();
// @ts-ignore
export const BottomTabNavigator = ({navigation, route}) => {
    function getHeaderTitle(route: string) {
        switch (route) {
            case 'GalleryScreen':
                return 'Gallery';
            case 'Albums':
                return 'Albums';
            case 'Camera':
                return 'Camera';
        }
    }

    function getTabIcon(route: string, color: number | ColorValue | undefined){
        let iconName= 'image-multiple-outline';

        switch (route) {
            case 'GalleryScreen':
                iconName = 'image-multiple-outline';
                break;
            case 'Albums':
                iconName = 'image-album';
                break;
            case 'Camera':
                iconName = 'camera-outline';
                break;
            default:
                break;
        }

        return <Icon name={iconName} color={color} size={24} />;
    }

    useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
        navigation.setOptions({ headerTitle: getHeaderTitle(routeName) });
        navigation.setOptions({ headerTintColor: theme.colors.text });

    }, [navigation, route]);


    return (
        <BottomTab.Navigator
            initialRouteName="GalleryScreen"
            screenOptions={{
                headerShown: false
            }}>
            <BottomTab.Screen
                name="GalleryScreen"
                component={GalleryImagesNavigator}
                options={{
                    title: getHeaderTitle('GalleryScreen'),
                    tabBarIcon: ({color}) => getTabIcon('GalleryScreen', color),
                    }}
            />
            <BottomTab.Screen
                name="Albums"
                component={GalleryAlbumsNavigator}
                options={{
                    title: getHeaderTitle('Albums'),
                    tabBarIcon: ({color}) => getTabIcon('Albums', color),
                }}
            />
            <BottomTab.Screen
                name="Camera"
                component={CameraScreen}
                options={{
                    title: getHeaderTitle('Camera'),
                    tabBarIcon: ({color}) => getTabIcon('Camera', color),
                }}
            />
        </BottomTab.Navigator>
    );
}
