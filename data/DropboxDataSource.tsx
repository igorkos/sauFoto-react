import * as React from "react";
import {Log} from "../hooks/log";
import {Dropbox, DropboxAuth, files} from "dropbox";
import {authorize} from "react-native-app-auth";
import AsyncStorage from "@react-native-community/async-storage";
import {SaufotoImage, SaufotoAlbum} from "./SaufotoImage"
import FastImage from "react-native-fast-image";
const CLIENT_ID = 'e7vfy8jyt9ees59'
const CLIENT_SECRET = 'qcvhtg8zr1bwlow'
const CLIENT_REDIRECT = 'com.saufoto://oauth'
const config = {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUrl: CLIENT_REDIRECT,
    scopes: ['files.metadata.read','files.content.read', 'account_info.read', 'file_requests.read'],
    serviceConfiguration: {
        authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
        tokenEndpoint: `https://www.dropbox.com/oauth2/token`,
    },

};

export async function isDropboxAuth() {
    const token = await AsyncStorage.getItem('dropboxToken')
    if(token != null) {
        let config = JSON.parse(token)
        if (new Date(config.accessTokenExpiresAt).getTime() < Date.now()) {
            return false
        }
    }
    Log.debug("Dropbox is authorised :" + token === null ? 'false':'true')
    return token !== null
}

export async function dropboxAuth() {
    if( await isDropboxAuth() === false ) {
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

const okFileExtensions = Array(".jpg", ".jpeg", ".png", ".gif", ".heic")

async function dropboxInstance() {
   // await resetDropboxAccess()
    const config = await dropboxAuth()
    Log.debug("Dropbox config:" + JSON.stringify(config))
    return new Dropbox({ accessToken: config.accessToken,
        accessTokenExpiresAt: new Date(config.accessTokenExpiresAt),
        refreshToken: config.refreshToken,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET});
}

export async function DropboxImages(root) {
    const dbx = await dropboxInstance()
    const photosTemp = await dbx.filesListFolder({ path: root })
    Log.debug("Received Dropbox images:" + photosTemp.result.entries.length)
    const parsePath = require('parse-filepath');
    const photos = photosTemp.result.entries.filter((value) => {
        let file = parsePath(value.path_lower)
        if (file.ext === '') { return true}
        else {
            return okFileExtensions.includes(file.ext)
        }
    })

   return Array.apply(null, Array(photos.length)).map( (v, i) => {
        let dbxEntry = photos[i]
        let object
        if (dbxEntry['.tag'] === 'folder') {
            object = {} as SaufotoAlbum
            object.id = dbxEntry.id
            object.type = 'album'
            object.title = dbxEntry.name
            object.placeHolderImage = 'folder_blue.png'
            object.originalUri = dbxEntry.path_lower
        } else if (dbxEntry['.tag'] === 'file') {
            object = {} as SaufotoImage
            object.id = dbxEntry.id
            object.type = 'image'
            object.title = dbxEntry.name
            object.placeHolderImage = 'image_placeholder.png'
            object.originalUri = dbxEntry.path_lower
        }
        return object;
    })
};

export async function getThumbsData(path) {
    const dbx = await dropboxInstance()
    const thumb = await dbx.filesGetThumbnailV2({
        format:{'.tag': 'jpeg'},
        mode: {'.tag': 'strict'},
        resource: {
            ".tag": "path",
            path: path
        },
        size: {
            '.tag': 'w256h256'
        }
    })
    const blob = thumb.result["fileBlob"]
    const type = blob.type
    return blob
}

export async function resetDropboxAccess() {
    await AsyncStorage.removeItem('dropboxToken')
}


