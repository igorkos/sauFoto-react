import * as React from "react";
import {SplashScreen} from './SplashScreen';
//import SigningScreen from "./SigningScreen";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {RootStackParamList, RootTabParamList, RootTabScreenProps} from "./drawer/types";
import {StatusBar} from "react-native";
import {DrawerNavigator} from "../navigation/DrawerNavigator";
import {theme} from "../constants/themes";
import {NavigationContainer} from "@react-navigation/native";

const RootStack = createNativeStackNavigator();

export default function RootStackScreen() {
    return (
        <RootStack.Navigator >
            <RootStack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
        </RootStack.Navigator>)
};

/*
<RootStack.Screen name="SigningScreen" component={SigningScreen}/>
 */
