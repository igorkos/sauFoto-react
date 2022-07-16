import * as React from "react";
import {Log} from "../hooks/log";
import {Dropbox, DropboxAuth, files} from "dropbox";
import {SaufotoImage, SaufotoAlbum, saufotoImage} from "./SaufotoImage"
import {authorizeWith} from "./AuthorizationProvicer";
import {DataSourceProvider, LoadImagesResponse} from "./DataSourceProvider";
import {useEffect, useState} from "react";
import {ThumbSize} from "../constants/Images";
import {ServiceType} from "./ServiceType";
import {ServiceTokens} from "./DataServiceConfig";

const okFileExtensions = Array(".jpg", ".jpeg", ".png", ".gif", ".heic")

export namespace DropboxProvider {
    async function dropboxInstance(config: ServiceTokens) {
        //SLog.debug("Dropbox config:" + JSON.stringify(config))
        return new Dropbox({
            accessToken: config.accessToken,
            accessTokenExpiresAt: new Date(config.accessTokenExpiresAt),
            refreshToken: config.refreshToken,
            clientId: config.clientId,
            clientSecret: config.clientSecret
        });
    }

    export async function loadImages(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        const dbx = await dropboxInstance(config)
        const folder = root ? root:''
        let photosTemp
        if(page !== null) {
            photosTemp = await dbx.filesListFolderContinue({cursor: page})
        } else {
            photosTemp = await dbx.filesListFolder({path: folder})
        }
        Log.debug("Received Dropbox entries:" + photosTemp.result.entries.length)
        const parsePath = require('parse-filepath');
        const photos = photosTemp.result.entries.filter((value) => {
            if( value['.tag'] === 'folder' || value['.tag'] === 'file' ) {
                let file = parsePath(value.path_lower)
                if (file.ext === '') {
                    return true
                } else {
                    return okFileExtensions.includes(file.ext)
                }
            }
            return false
        })
        const objects =  Array.apply(null, Array(photos.length)).map((v, i) => {
            let dbxEntry = photos[i]
            let object: SaufotoAlbum | SaufotoImage
            if (dbxEntry['.tag'] === 'folder') {
                object = {} as SaufotoAlbum
                object.id = dbxEntry.id
                object.type = 'album'
                object.title = dbxEntry.name
                object.placeHolderImage = 'folder_blue.png'
                object.originalUri = dbxEntry.path_lower as string
            } else if (dbxEntry['.tag'] === 'file') {
                object = saufotoImage()
                object.id = dbxEntry.id
                object.title = dbxEntry.name
                object.originalUri = dbxEntry.path_lower as string
            }
            // @ts-ignore
            return object;
        })
        const result = {nextPage: photosTemp.result.cursor, items: objects, hasMore: photosTemp.result.has_more }
        Log.debug("Filtered Dropbox images & folders:" + photos.length + "result: " + JSON.stringify(result) )

        return new Promise((resolve, reject) => {
            resolve(result)
        })
    };

    export async function getThumbsData(config: ServiceTokens, path: string, size: string ) {
        const dbx = await dropboxInstance(config)
        const tSize = size.replace('-','')
        const ext = path.split('.').pop();
        Log.debug("Dropbox load thumb for :" + path +  "ext: " + ext + " size: " + size )
        if(okFileExtensions.includes('.'+ ext)) {
            return new Promise(async (resolve, reject) => {
                const response = await dbx.filesGetThumbnailV2({
                    format: {'.tag': 'jpeg'},
                    mode: {'.tag': 'strict'},
                    resource: {
                        ".tag": "path",
                        path: path
                    },
                    size: {
                        // @ts-ignore
                        '.tag': tSize
                    }
                })
                //Log.debug("Dropbox get thumb data for :" + path)
                // @ts-ignore
                const blob = response.result["fileBlob"]
                const fileReaderInstance = new FileReader();
                fileReaderInstance.onload = () => {
                    const data = fileReaderInstance.result as string
                    const uri = data.replace('application/octet-stream', 'image/jpeg')
                    //Log.debug("Get Dropbox image as data url for: '" + path + "'");
                    resolve(uri)
                }
                fileReaderInstance.readAsDataURL(blob)
            })
        } else {
            return new Promise((resolve, reject) => {
                reject("Folder")
            })
        }

    }

    export async function loadAlbums(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return loadImages(config, root, page)
    }

    export function albumId(media:SaufotoAlbum | SaufotoImage) {
        return media.originalUri
    }
}
