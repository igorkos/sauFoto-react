import * as React from "react";
import {SplashScreen} from './SplashScreen';
import {createNativeStackNavigator} from "@react-navigation/native-stack";

const RootStack = createNativeStackNavigator();

export default function RootStackScreen() {
    return (
        <RootStack.Navigator >
            <RootStack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
        </RootStack.Navigator>)
};
