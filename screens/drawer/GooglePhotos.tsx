import * as React from "react";
import {photosListView} from "./PhotosCollectionList";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../constants/themes";
import {NavigationDrawerBack, NavigationDrawerRightImportImages} from "../../components/NavigationBar/DrawerButtons";
import useColorScheme from "../../hooks/useColorScheme";
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import {RootTabParamList, RootTabScreenProps} from "./types";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {ServiceType} from "../../data/ServiceType";
import { ColorValue } from "react-native";

const Stack = createNativeStackNavigator();
// @ts-ignore
export function GoogleNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="GoogleImages" component={GoogleTabNavigator} options={{
                headerShown: true,
                title: "Google",
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerBack navigationProps={navigation}/>
                ),
                headerRight: () => (
                    // @ts-ignore
                    <NavigationDrawerRightImportImages navigationProps={navigation} type={ServiceType.Google}/>
                ),
            }}/>
            <Stack.Screen name="GoogleAlbumImages" component={GooglePhotosScreen} options={{
                headerShown: true,
                title: "Google",
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerRight: () => (
                    // @ts-ignore
                    <NavigationDrawerRightImportImages navigationProps={navigation} type={ServiceType.Google}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}

// @ts-ignore
function GooglePhotosScreen({navigation, route}) {
    return photosListView(navigation, route, ServiceType.Google, false, true)
};
// @ts-ignore
function GoogleAlbumsScreen({navigation, route}) {
    return photosListView(navigation, route, ServiceType.Google, true, true)
};

const BottomTab = createBottomTabNavigator<RootTabParamList>();
// @ts-ignore
const GoogleTabNavigator = ({navigation, route}) => {
    const colorScheme = useColorScheme();

    function getHeaderTitle(route: string) {
        switch (route) {
            case 'ImagesScreen':
                return 'Google Images';
            case 'Albums':
                return 'Google Albums';
        }
    }

    function getTabIcon(route: string, color: number | ColorValue | undefined){
        let iconName = 'image-multiple-outline';

        switch (route) {
            case 'ImagesScreen':
                iconName = 'image-multiple-outline';
                break;
            case 'Albums':
                iconName = 'image-album';
                break;
            default:
                break;
        }

        return <Icon name={iconName} color={color} size={24} />;
    };

    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'ImagesScreen';
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
                name="ImagesScreen"
                component={GooglePhotosScreen}
                options={({ navigation }: RootTabScreenProps<'ImagesScreen'>) => ({
                    title: getHeaderTitle('ImagesScreen'),
                    tabBarIcon: ({color}) => getTabIcon('ImagesScreen', color),
                })}
            />

        </BottomTab.Navigator>
    );
}

/*
  <BottomTab.Screen
                name="Albums"
                component={GoogleAlbumsScreen}
                options={{
                    title: getHeaderTitle('Albums'),
                    tabBarIcon: ({color}) => getTabIcon('Albums', color),
                }}
            />
 */
