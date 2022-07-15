import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {RootStackParamList, RootTabParamList, RootTabScreenProps} from "../screens/drawer/types";
import useColorScheme from "../hooks/useColorScheme";
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import * as React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CameraScreen from "../screens/Camera";
import AlbumsScreen from "../screens/Albums";
import ImageGallery from "../screens/ImageGallery";
import {theme} from "../constants/themes";
import ImageView from "../screens/ImageViewSource";
import {HeaderBackButton} from "@react-navigation/elements";
import {Log} from "../hooks/log";
import {TouchableOpacity, View} from "react-native";

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

const NavigationDrawerLeft = (props) => {
    //Structure for the navigatin Drawer
    const toggleDrawer = () => {
        //Props to open/close the drawer
        props.navigationProps.toggleDrawer();
    };

    return (
        <View style={{ flexDirection: 'row', marginEnd:10}}>
            <TouchableOpacity onPress={toggleDrawer}>
                <Icon name={'menu'} color={theme.colors.text} size={25}/>
            </TouchableOpacity>
        </View>
    );
};

export function RootNavigator({navigation}) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerShown: true,

            }}>
            <Stack.Screen  name="Home" component={BottomTabNavigator} options={{
                title:"Gallery",
                headerShown: true,
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerLeft navigationProps={navigation} />
                ),
            }}/>
            <Stack.Group screenOptions={{presentation: 'modal'}}>
                <Stack.Screen  name="ImageCarousel" component={ImageView}  />
            </Stack.Group>
        </Stack.Navigator>
    );
}

const BottomTab = createBottomTabNavigator<RootTabParamList>();

export const  BottomTabNavigator = ({navigation, route}) => {
    const colorScheme = useColorScheme();

    function getHeaderTitle(route) {
        switch (route) {
            case 'GalleryScreen':
                return 'Gallery';
            case 'Albums':
                return 'Albums';
            case 'Camera':
                return 'Camera';
        }
    }

    function getTabIcon(route, color){
        let iconName;

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
    };

    React.useLayoutEffect(() => {
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
                component={ImageGallery}
                options={({ navigation }: RootTabScreenProps<'GalleryScreen'>) => ({
                    title: getHeaderTitle('GalleryScreen'),
                    tabBarIcon: ({color}) => getTabIcon('GalleryScreen', color),
                    })}
            />
            <BottomTab.Screen
                name="Albums"
                component={AlbumsScreen}
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
