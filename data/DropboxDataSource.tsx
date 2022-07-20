import * as React from "react";
import {Log} from "../hooks/log";
import {Dropbox, DropboxResponse, files} from "dropbox";
import {SaufotoAlbum, SaufotoImage, SaufotoObjectType, ServiceImportDropbox, ServiceImportEntry} from "./SaufotoImage"
import {LoadImagesResponse} from "./DataSourceProvider";
import {ServiceTokens} from "./DataServiceConfig";
import {SaufotoProvider} from "./SaufotoDataSource";
import {ServiceType} from "./ServiceType";
import {ThumbSize} from "../constants/Images";
import { Image } from 'react-native';

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

    export async function loadImages(realm: Realm, config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        const dbx = await dropboxInstance(config)
        const folder = root ? root : ''
        let photosTemp: DropboxResponse<files.ListFolderResult>
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
            const  type = dbxEntry['.tag'] === 'file' ? SaufotoObjectType.Image:SaufotoObjectType.Album
            // @ts-ignore
            return SaufotoProvider.findOrCreateImport(realm, ServiceType.Dropbox,type, dbxEntry.id, folder, dbxEntry.name, dbxEntry.path_lower as string) as ServiceImportDropbox;
        })
        return {nextPage: photosTemp.result.cursor, items: objects, hasMore: photosTemp.result.has_more }
    }

    export async function getThumbsData(realm:Realm, config: ServiceTokens, object: ServiceImportEntry, size: ThumbSize ): Promise<string> {
        const dbx = await dropboxInstance(config)
        const tSize = size.replace('-','')
        const path = object.originalUri!
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
                fileReaderInstance.onload = async () => {
                    const data = fileReaderInstance.result as string
                    const blobUri = data.replace('application/octet-stream', 'image/jpeg')
                    const thumb = await object.createThumb(size, blobUri, realm)
                    //Log.debug("Get Dropbox image as data url for: '" + path + "'");
                    resolve(thumb)
                }
                fileReaderInstance.readAsDataURL(blob)
            })
        } else {
            // @ts-ignore
            const {default: folder } = await import("../assets/images/folder_blue.png")
            return Image.resolveAssetSource(folder).uri
        }

    }

    export async function loadAlbums(realm:Realm, config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return loadImages(realm, config, root, page)
    }

    export function albumId(realm:Realm, media:SaufotoAlbum | SaufotoImage): string | null {
        return media.originalUri === undefined ? null:media.originalUri
    }
}
