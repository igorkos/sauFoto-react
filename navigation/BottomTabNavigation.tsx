import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {RootTabParamList} from "../screens/drawer/types";
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import * as React from "react";
import {useLayoutEffect} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CameraScreen from "../screens/Camera";
import {theme} from "../styles/themes";
import {AlbumAddImagesScreen, AlbumImagesScreen, GalleryAlbumsNavigator} from "../screens/Albums";
import {HeaderNavigationRight, NavigationDrawerBack, NavigationDrawerLeft,} from "../screens/compnents/DrawerButtons";
import {GalleryImagesNavigator, SaufotoGalleryPreviewScreen} from "../screens/ImageGallery";
import {ColorValue} from "react-native";
import {ActionEvents} from "../screens/types/ActionEvents";
import {View} from "../styles/Themed";

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
                <Stack.Screen name="SaufotoAlbumImages" component={AlbumImagesScreen} options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {backgroundColor: theme.colors.headerBackground,},
                    headerTintColor: theme.colors.text,
                    headerLeft: () => (
                        <NavigationDrawerBack navigationProps={navigation}/>
                    ),
                    headerRight: () => (
                        <HeaderNavigationRight actions={[ActionEvents.selectImages, ActionEvents.addImages, ActionEvents.deleteAlbum]}/>
                    ),
                }}/>
                <Stack.Screen name="SaufotoAlbumAddImages" component={AlbumAddImagesScreen} options={{
                    headerShown: true,
                    title: "",
                    headerStyle: {backgroundColor: theme.colors.headerBackground,},
                    headerTintColor: theme.colors.text,
                    headerLeft: () => (
                        <NavigationDrawerBack navigationProps={navigation}/>
                    ),
                    headerRight: () => (
                        <HeaderNavigationRight actions={[ActionEvents.addToAlbum]}/>
                    ),
                }}/>
                <Stack.Screen name="CameraModal" component={CameraScreen} options={{
                    headerShown: false,
                    title: "",
                }}/>
            </Stack.Group>
        </Stack.Navigator>
    );
}
const Dummy = () => <View style={{ flex: 1, backgroundColor: "red" }} />
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
            id="BottomTab"
            initialRouteName="GalleryScreen"
            screenOptions={{
                headerShown: false,
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
                component={Dummy}
                options={{
                    title: getHeaderTitle('Camera'),
                    tabBarIcon: ({color}) => getTabIcon('Camera', color),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                    e.preventDefault()
                    navigation.navigate("CameraModal")
                },
                })
            }
            />
        </BottomTab.Navigator>
    );
}
