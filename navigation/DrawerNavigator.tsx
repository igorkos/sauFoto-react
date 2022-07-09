import * as React from "react";
import SaufotoDrawer from '../components/SaufotoDrawer';
import GooglePhotosScreen from '../screens/drawer/GooglePhotos'
import DropboxScreen from '../screens/drawer/Dropbox';
import SettingsScreen from '../screens/drawer/Settings';
import AboutScreen from '../screens/drawer/About';
import {BottomTabNavigator} from './BottomTabNavigation';

import {createDrawerNavigator} from '@react-navigation/drawer';
import CameraScreen from "../screens/drawer/CameraImport";
import {theme} from "../constants/themes";
import {StatusBar, View} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {SplashScreen} from "../screens/SplashScreen";
import {AuthContext} from "../components/context";

const Drawer = createDrawerNavigator();

export function DrawerNavigator() {
    return (
            <Drawer.Navigator
                useLegacyImplementation
                drawerContent={(props) => <SaufotoDrawer {...props}
                />}>
                <Drawer.Screen name="Gallery" component={BottomTabNavigator}/>
                <Drawer.Screen name="Camera" component={CameraScreen}/>
                <Drawer.Screen name="Google" component={GooglePhotosScreen}/>
                <Drawer.Screen name="Dropbox" component={DropboxScreen}/>
                <Drawer.Screen name="Settings" component={SettingsScreen}/>
                <Drawer.Screen name="About" component={AboutScreen}/>
                <Drawer.Screen name="SplashScreen" component={SplashScreen}/>
            </Drawer.Navigator>
    );
};
