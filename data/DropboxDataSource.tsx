import * as React from "react";
import {Log} from "../utils/log";
import {Dropbox, DropboxResponse, files} from "dropbox";
import {SaufotoImage, SaufotoObjectType} from "./watermelon/SaufotoImage"
import {LoadImagesResponse} from "./DataSourceProvider";
import {ServiceTokens} from "./DataServiceConfig";
import {ServiceType} from "./ServiceType";
import {ThumbSize} from "../styles/Images";
import { Image } from 'react-native';
import {ImportObject} from "./watermelon/ImportObject";
import {addToTable} from "./watermelon/DataSourceUtils";
import ImageResizer from "react-native-image-resizer";
// @ts-ignore
import {MediaInfoMetadata} from "dropbox/types/dropbox_types";
import {cacheImageData} from "../utils/FileUtils";

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
        let hasMore = true
        let nextPage = page
        let count = 0

        Log.debug("Dropbox items load start")
        const folder = root ? root : ''

        while (hasMore) {
            let photosTemp: DropboxResponse<files.ListFolderResult>
            if (nextPage !== null) {
                photosTemp = await dbx.filesListFolderContinue({cursor: nextPage})
            } else {
                photosTemp = await dbx.filesListFolder({path: folder})
            }

            Log.debug("Received Dropbox entries:" + photosTemp.result.entries.length)

            const parsePath = require('parse-filepath');
            const photos = photosTemp.result.entries.filter((value) => {
                if (value['.tag'] === 'folder' || value['.tag'] === 'file') {
                    let file = parsePath(value.path_lower)
                    if (file.ext === '') {
                        return true
                    } else {
                        return okFileExtensions.includes(file.ext)
                    }
                }
                return false
            })

            count += await addToTable( photos, ServiceType.Dropbox, (root === null ? '' : root),
                (item: any) => { return item['.tag'] === 'file' ? SaufotoObjectType.Image : SaufotoObjectType.Album }, 'name', 'path_lower')

            Log.debug("Added Dropbox entries: " + count)

            hasMore = photosTemp.result.has_more
            nextPage = photosTemp.result.cursor
        }
        Log.debug("Dropbox items load complete")
        return  {nextPage: null, items: [], hasMore: false }
    }

    export async function getThumbsData(config: ServiceTokens, object: ImportObject|SaufotoImage, size: ThumbSize ): Promise<string> {
        const dbx = await dropboxInstance(config)
        const tSize = size.replace('-','')
        const path = await  object.getOriginalUri()
        const ext = path.split('.').pop();
        Log.debug("Dropbox load thumb for :" + path +  " ext: " + ext + " size: " + tSize )

        if(okFileExtensions.includes('.'+ ext)) {
            return new Promise(async (resolve) => {
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
                    const thumb = await (object as ImportObject).createThumb(size, blobUri)
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

    export async function getImageData( config: ServiceTokens, object: SaufotoImage): Promise<string> {
        const dbx = await dropboxInstance(config)
        const path = await  object.getOriginalUri()
        return new Promise(async (resolve, reject) => {
            Log.debug("Dropbox request image data for :" + path)
            const response = await dbx.filesDownload({path:path})

            if( response.status >= 300) {
                Log.error("Download Dropbox file error: " + response.status)
                reject(response.status)
            }
            // @ts-ignore
            const blob = response.result["fileBlob"]
            const metadata = (response.result.media_info as MediaInfoMetadata)?.metadata
            const width = metadata?.dimensions.width
            // @ts-ignore
            const height = metadata?.dimensions.height
            const mediaInfo = {
                width: width,
                height: height,
                creationTime: metadata?.time_taken,
                location: {
                    latitude: metadata?.location.latitude,
                    longitude: metadata?.location.longitude
                }

            }
            await object.setMediaInfo(mediaInfo)
            Log.debug("Dropbox get image data for :" + path + " size:(" +width + ":" + height + ")")
            const uri = await cacheImageData(blob, width, height).then((value) => {
                object.setLocalImageFile(value)
                resolve(value)
            })
        })
    }

    export async function loadAlbums(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return loadImages(config, root, page)
    }

    export function albumId(media:ImportObject|SaufotoImage): string | null {
        const entry = media as ImportObject
        return entry.originalUri === undefined ? null:entry.originalUri
    }
}
