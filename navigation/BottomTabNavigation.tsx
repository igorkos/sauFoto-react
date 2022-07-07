import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {RootTabParamList, RootTabScreenProps} from "../components/types";
import useColorScheme from "../hooks/useColorScheme";
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import * as React from "react";
import Colors from "../constants/Colors";
import SaufotoGalleryScreen from "../screens/SaufotoGalleryScreen";
import TabTwoScreen from "../screens/TabTwoScreen";
import GooglePhotosScreen from "../screens/drawer/GooglePhotos";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

export const  BottomTabNavigator = ({navigation, route}) => {
    const colorScheme = useColorScheme();

    function getHeaderTitle(route) {

        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';

        switch (routeName) {
            case 'TabOne':
                return 'TabOne';
            case 'TabTwo':
                return 'TabTwo';
            case 'Photos':
                return 'Photos';
        }
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({ headerTitle: getHeaderTitle(route) });
    }, [navigation, route]);


    return (
        <BottomTab.Navigator
            initialRouteName="Library"
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme].tint,
                headerShown: false,
            }}>
            <BottomTab.Screen
                name="Library"
                component={SaufotoGalleryScreen}
                options={({ navigation }: RootTabScreenProps<'Library'>) => ({
                    title: 'Library',
                    tabBarIcon:({ color }) => (
                        <Icon name="image-multiple-outline" color={color} size={26} />
                    ),
                })}
            />
            <BottomTab.Screen
                name="TabTwo"
                component={TabTwoScreen}
                options={{
                    title: 'Tab Two'
                }}
            />
            <BottomTab.Screen
                name="Photos"
                component={GooglePhotosScreen}
                options={{
                    title: 'Photos'
                }}
            />
        </BottomTab.Navigator>
    );
}
