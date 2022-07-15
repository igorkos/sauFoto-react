import * as React from "react";
import {Log} from "../hooks/log";
import {Dropbox, DropboxAuth, files} from "dropbox";
import {authorize, logout, revoke} from "react-native-app-auth";
import AsyncStorage from "@react-native-community/async-storage";
import {SaufotoImage, SaufotoAlbum, saufotoImage} from "./SaufotoImage"
import {authorizeWith} from "./AuthorizationProvicer";
import {ServiceType} from "./DataServiceConfig";
import {LoadImagesResponse} from "./DataSourceProvider";

const okFileExtensions = Array(".jpg", ".jpeg", ".png", ".gif", ".heic")

export namespace DropboxProvider {
    async function dropboxInstance() {
        // await resetDropboxAccess()
        const config = await authorizeWith(ServiceType.Dropbox)
        Log.debug("Dropbox config:" + JSON.stringify(config))
        return new Dropbox({
            accessToken: config.accessToken,
            accessTokenExpiresAt: new Date(config.accessTokenExpiresAt),
            refreshToken: config.refreshToken,
            clientId: config.clientId,
            clientSecret: config.clientSecret
        });
    }

    export async function loadImages(config, root, page): Promise<LoadImagesResponse> {
        const dbx = await dropboxInstance()
        const photosTemp = await dbx.filesListFolder({path: root})
        Log.debug("Received Dropbox images:" + photosTemp.result.entries.length)
        const parsePath = require('parse-filepath');
        const photos = photosTemp.result.entries.filter((value) => {
            let file = parsePath(value.path_lower)
            if (file.ext === '') {
                return true
            } else {
                return okFileExtensions.includes(file.ext)
            }
        })

        return Array.apply(null, Array(photos.length)).map((v, i) => {
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
                object = saufotoImage()
                object.id = dbxEntry.id
                object.title = dbxEntry.name
                object.originalUri = dbxEntry.path_lower
            }
            return object;
        })
    };

    export async function getThumbsData(path, size) {
        const dbx = await dropboxInstance()
        const tSize = size.replace('-','')
        const thumb = await dbx.filesGetThumbnailV2({
            format: {'.tag': 'jpeg'},
            mode: {'.tag': 'strict'},
            resource: {
                ".tag": "path",
                path: path
            },
            size: {
                '.tag':tSize
            }
        })
        const blob = thumb.result["fileBlob"]
        const type = blob.type
        return blob
    }

}
