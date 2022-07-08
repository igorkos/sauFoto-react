/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import * as React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import {DrawerNavigator} from './DrawerNavigator';
//import RootStackScreen from '../screens/RootStackScreen'
//import {stacks} from "../stacks/StacksManager";
import {SplashScreen} from '../screens/SplashScreen';
import {theme} from "../constants/themes";

export default function Navigation() {
  return (
    <NavigationContainer theme={theme}>
        {RouteToFirstScreen()}
    </NavigationContainer>
  );
}

//{stacks.isLoggedIn ? <DrawerNavigator/> : <RootStackScreen/>}
//import { userSession } from '../stacks/auth';
function RouteToFirstScreen(){
    return DrawerNavigator()
    /*if(stacks.isLoggedIn) {
        return DrawerNavigator()
    } else {
        return RootStackScreen()
    }*/
}
