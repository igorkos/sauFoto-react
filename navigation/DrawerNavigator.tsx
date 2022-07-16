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
import {SaufotoAlbum, SaufotoMedia} from "../data/SaufotoImage";
import {GoogleNavigator} from "../screens/drawer/GooglePhotos";

const Drawer = createDrawerNavigator();

export const MediaContext = React.createContext(null);

export function DrawerNavigator() {

    const mediaContext = React.useMemo(
        () => ({
            importGallery: async (items:[SaufotoMedia]) => {
                Log.debug("Import to Gallery", JSON.stringify(items))
            },
            importTo: async (items:[SaufotoMedia], album?:SaufotoAlbum) => {
                Log.debug("Import to Album")
            },
        }), [],);

    return (
        <MediaContext.Provider value={mediaContext}>
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
        </MediaContext.Provider>
    );
};
