import * as React from "react";
import SaufotoDrawer from './SaufotoDrawer';
import {DropboxNavigator} from '../screens/drawer/Dropbox';
import SettingsScreen from '../screens/drawer/Settings';
import AboutScreen from '../screens/drawer/About';
import {RootNavigator} from './BottomTabNavigation';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {CameraNavigator} from "../screens/drawer/CameraImport";
import {SplashScreen} from "../screens/SplashScreen";
import {Log} from "../hooks/log";
import {SaufotoAlbum} from "../data/watermelon/SaufotoImage";
import {GoogleNavigator} from "../screens/drawer/GooglePhotos";
import {useMemo} from "react";
import {ImportObject} from "../data/watermelon/ImportObject";

const Drawer = createDrawerNavigator();


export function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <SaufotoDrawer {...props}/>}
            screenOptions={{headerShown: false }}>
            <Drawer.Screen name="Gallery" component={RootNavigator} />
            <Drawer.Screen name="Camera" component={CameraNavigator} />
            <Drawer.Screen name="Google" component={GoogleNavigator}/>
            <Drawer.Screen name="Dropbox" component={DropboxNavigator}/>
            <Drawer.Screen name="Settings" component={SettingsScreen}/>
            <Drawer.Screen name="About" component={AboutScreen}/>
            <Drawer.Screen name="SplashScreen" component={SplashScreen}/>
        </Drawer.Navigator>
    )
}
