/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import * as React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import {DrawerNavigator} from './DrawerNavigator';
import {theme} from "../constants/themes";
import AsyncStorage from "@react-native-community/async-storage";
import {AuthContext} from '../components/context';
import {Provider as PaperProvider,} from 'react-native-paper';
import {Log} from "../hooks/log";
import RootStackScreen from "../screens/RootStackScreen";
import {StatusBar} from "react-native";

const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
};

const loginReducer = (prevState, action) => {
    Log.debug("loginReducer: action {" + action.type + "} -> {id:" + action.id + ", token:" + action.token + "}")
    switch (action.type) {
        case 'RETRIEVE_TOKEN':
            if (prevState.isLoading === false) return prevState
            return {
                ...prevState,
                isLoading: false
            };
        case 'LOGIN':
            if (prevState.isLoading === false && prevState.userName === action.id  && prevState.userToken === action.token) return prevState
            return {
                ...prevState,
                userName: action.id,
                userToken: action.token,
                isLoading: false,
            };
        case 'LOGOUT':
            if (prevState.isLoading === false && prevState.userName === null  && prevState.userToken === null) return prevState
            return {
                ...prevState,
                userName: null,
                userToken: null,
                isLoading: false,
            };
        case 'REGISTER':
            if (prevState.isLoading === false && prevState.userName === action.id  && prevState.userToken === action.token) return prevState
            return {
                ...prevState,
                userName: action.id,
                userToken: action.token,
                isLoading: false,
            };
    }
};

export default function Navigation() {
    Log.debug("Navigation");
    const [loginState, dispatch] = React.useReducer(
        loginReducer,
        initialLoginState,
    );

    const authContext = React.useMemo(
        () => ({
            signIn: async foundUser => {
                Log.debug("signIn: " + foundUser);
                // setUserToken('fgkj');
                // setIsLoading(false);
                const userToken = foundUser.userToken;
                const userName = foundUser.username;

                try {
                    if (userToken !== null) {
                        await AsyncStorage.setItem('userToken', userToken);
                    } else {
                        await AsyncStorage.removeItem('userToken');
                    }
                } catch (e) {
                    Log.error(e);
                }
                // console.log('user token: ', userToken);
                dispatch({type: 'LOGIN', id: userName, token: userToken});
            },
            signOut: async () => {
                // setUserToken(null);
                // setIsLoading(false);
                try {
                    await AsyncStorage.removeItem('userToken');
                } catch (e) {
                    Log.error(e);
                }
                dispatch({type: 'LOGOUT'});
            },
            signUp: () => {
                // setUserToken('fgkj');
                // setIsLoading(false);
            },
        }),
        [],
    );

   /* useEffect(() => {
        setTimeout(async () => {
            // setIsLoading(false);
            let userToken;
            userToken = null;
            try {
                userToken = await AsyncStorage.getItem('userToken');
            } catch (e) {
                Log.error(e);
            }
            // console.log('user token: ', userToken);
            dispatch({type: 'RETRIEVE_TOKEN', token: userToken});
        }, 1000);
    }, [loginState]);
    */

    return (
        <PaperProvider theme={theme}>
            <AuthContext.Provider value={authContext}>
                <NavigationContainer theme={theme}>
                    {loginState.userToken !== null ? (<StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'dark-content' : 'light-content'} />) : (<StatusBar hidden={true} />)}
                    {loginState.userToken !== null ? (DrawerNavigator()):(RootStackScreen())}
                </NavigationContainer>
            </AuthContext.Provider>
        </PaperProvider>
  );
}
