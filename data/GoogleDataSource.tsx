import {Log} from "../hooks/log";
import {authorize} from "react-native-app-auth";
import AsyncStorage from "@react-native-community/async-storage";

const GOOGLE_OAUTH_APP_GUID = '962165832520-n4lj2iqr3bjge6kf9fp89b0rnrj6hf5r'
const config = {
    issuer: 'https://accounts.google.com',
    clientId: GOOGLE_OAUTH_APP_GUID +'.apps.googleusercontent.com',
    redirectUrl: 'com.googleusercontent.apps.'+ GOOGLE_OAUTH_APP_GUID +':/oauth2redirect/google',
    scopes: ['openid', 'profile']
};

export async function isGoogleAuth() {
    const token = await AsyncStorage.getItem('ggogleToken')
    if(token != null) {
        let config = JSON.parse(token)
        if (new Date(config.accessTokenExpiresAt).getTime() < Date.now()) {
            return false
        }
    }
    Log.debug("Google is authorised :" + token === null ? 'false':'true')
    return token !== null
}

export async function googleAuth() {
    if( await isGoogleAuth() === false ) {
        await authorize(config).then( (result) => {
            Log.debug("Google auth success")
            const googleAuthConfig = {
                accessToken: result.accessToken,
                accessTokenExpiresAt: result.accessTokenExpirationDate,
                refreshToken: result.refreshToken,
            }
            AsyncStorage.setItem('ggogleToken', JSON.stringify(googleAuthConfig))
        });
    }
    return await AsyncStorage.getItem('ggogleToken').then(req => JSON.parse(req))
}
