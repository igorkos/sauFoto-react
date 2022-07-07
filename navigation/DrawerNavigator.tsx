import * as React from "react";
import SaufotoDrawer from '../components/SaufotoDrawer';
import GooglePhotosScreen from '../screens/drawer/GooglePhotos'
import DropboxScreen from '../screens/drawer/Dropbox';
import SettingsScreen from '../screens/drawer/Settings';
import AboutScreen from '../screens/drawer/About';
import {BottomTabNavigator} from './BottomTabNavigation';

import {createDrawerNavigator} from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();


export  function DrawerNavigator() {

    return (
        <Drawer.Navigator
            useLegacyImplementation
            drawerContent={(props) => <SaufotoDrawer {...props} />}>

            <Drawer.Screen name="Gallery" component={BottomTabNavigator}/>
            <Drawer.Screen name="GooglePhotos" component={GooglePhotosScreen}/>
        </Drawer.Navigator>
    );
};
