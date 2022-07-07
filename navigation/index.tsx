/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SigninScreen from '../screens/SigninScreen';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import {BottomTabNavigator} from "../navigation/BottomTabNavigation"

import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../components/types';
import ImageView from "../screens/ImageViewScreen";
//import { userSession } from '../stacks/auth';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator/>
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}>
      <Stack.Screen  name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="ImageView" component={ImageView} options={{ headerShown: true }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
/*
function RouteToFirstScreen(){
    if(userSession.isUserSignedIn()) {
        return SigninScreen()
    } else {
        return BottomTabNavigator
    }
}*/
