import * as React from "react";
import {Log} from "../hooks/log";
import {Dropbox, DropboxAuth, files} from "dropbox";
import {authorize} from "react-native-app-auth";
import AsyncStorage from "@react-native-community/async-storage";
const CLIENT_ID = 'e7vfy8jyt9ees59'
const CLIENT_SECRET = 'qcvhtg8zr1bwlow'
const CLIENT_REDIRECT = 'com.saufoto://oauth'
const config = {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUrl: CLIENT_REDIRECT,
    scopes: ['files.metadata.read','files.content.read', 'account_info.read'],
    serviceConfiguration: {
        authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
        tokenEndpoint: `https://www.dropbox.com/oauth2/token`,
    },

};

export async function isDropboxAuth() {
    const token = await AsyncStorage.getItem('dropboxToken')
    Log.debug("Dropbox is authorised :" + token === null ? 'false':'true')
    return token !== null
}

export async function dropboxAuth() {
    if( await isDropboxAuth() === false) {
        await authorize(config).then( (result) => {
            Log.debug("Dropbox auth success")
            const dbxAuthConfig = {
                accessToken: result.accessToken,
                accessTokenExpiresAt: result.accessTokenExpirationDate,
                refreshToken: result.refreshToken,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET
            }
            AsyncStorage.setItem('dropboxToken', JSON.stringify(dbxAuthConfig))
        });
    }
    return await AsyncStorage.getItem('dropboxToken').then(req => JSON.parse(req))
}

export async function DropboxImages() {
    await resetDropboxAccess()
    const config = await dropboxAuth()
    Log.debug("Dropbox config:" + JSON.stringify(config))
    const dbx = new Dropbox({ accessToken: config.accessToken,
        accessTokenExpiresAt: new Date(config.accessTokenExpiresAt),
        refreshToken: config.refreshToken,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET});
    const photosTemp = await dbx.filesListFolder({ path: '' })
    Log.debug("Received Dropbox images:" + photosTemp)
    return Array.apply(null, Array(photosTemp.result.entries.length)).map((v, i) => {
        let entry: files.FolderMetadataReference;
        return {
            id:i,
            image: photosTemp.result.entries[i]
        };
    })
};

export async function resetDropboxAccess() {
    await AsyncStorage.removeItem('dropboxToken')
}

