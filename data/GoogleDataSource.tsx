import {Log} from "../hooks/log";
import {
    SaufotoAlbum,
    SaufotoImage,
    SaufotoObjectType,
    ServiceImportDropbox,
    ServiceImportEntry,
    ServiceImportGoogle
} from "./SaufotoImage";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {ServiceTokens} from "./DataServiceConfig";
import {SaufotoProvider} from "./SaufotoDataSource";
import {ServiceType} from "./ServiceType";
import { Thread } from 'react-native-threads';
import * as http from "http";

export namespace GoogleProvider {

    interface GoogleMediaItem {
        id: string,
        description: string,
        productUrl: string,
        baseUrl: string,
        mimeType: string,
        mediaMetadata: GoogleMediaMetadata,
        contributorInfo: GoogleContributorInfo,
        filename: string
    }

    interface GoogleContributorInfo {
        profilePictureBaseUrl: string,
        displayName: string
    }

    interface GoogleMediaMetadata {
        creationTime: string,
        width: string,
        height: string,
        // Union field metadata can be only one of the following:
        photo: GooglePhoto,
        video: GoogleVideo
    }

    interface GooglePhoto {
        cameraMake: string,
        cameraModel: string,
        focalLength: number,
        apertureFNumber: number,
        isoEquivalent: number,
        exposureTime: string
    }

    interface GoogleVideo {
        cameraMake: string,
        cameraModel: string,
        fps: number,
        status: 'UNSPECIFIED' | 'PROCESSING' | 'READY' | 'FAILED'
    }

    interface GoogleAlbum {
        id: string,
        description: string,
        productUrl: string,
        baseUrl: string,
        mimeType: string,
        mediaMetadata: GoogleMediaMetadata,
        contributorInfo: GoogleContributorInfo,
        filename: string
    }

    interface GoogleMediaListResponse {
        mediaItems: [GoogleMediaItem],
        nextPageToken: string
    }

    interface GoogleMediaListRequest {
        albumId: string,
        pageSize: number,
        pageToken: string,
        filters: [],//{ object (Filters) }
        orderBy: string,
    }

    const GOOGLE_MEDIA_ITEMS = 'https://photoslibrary.googleapis.com/v1/mediaItems'
    function albumImagesRequest(config: ServiceTokens, root: string | null, page: string | null) {
        let uri = GOOGLE_MEDIA_ITEMS + ":search"
        return page === null ? {uri: uri, params:{
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + config.accessToken
            },
            body: JSON.stringify({
                albumId: root,
                pageSize: 50
            })
        }} : {uri: uri, params:{
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + config.accessToken
                },
                body:  JSON.stringify({
                    albumId: root,
                    pageSize: 50,
                    pageToken: page
                })
            }}
    }

    function loadImagesRequest(config: ServiceTokens, page: string | null){
        let request = GOOGLE_MEDIA_ITEMS + "?pageSize=100"
        if( page !== null ) {
            request = request + '&pageToken=' + page
        }
        return {uri: request, params: {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + config.accessToken
            }
        }}
    }

    function getImageRequest(config: ServiceTokens, id: string){
        let request = GOOGLE_MEDIA_ITEMS + "/" + id
        return {uri: request, params: {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + config.accessToken
                }
            }}
    }
    async function getImage(realm:Realm, config: ServiceTokens, id: string): Promise<GoogleMediaItem> {
        let request = getImageRequest(config, id)
        return await fetch(request.uri, request.params).then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    Log.error("Load image error", response.body)
                    return null
                }
            }
        )
    }

    export async function loadImages(realm:Realm, config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {

        let hasMore = true
        let nextPage = page
        let count = 0
        const images = realm.objects("ServiceImportGoogle")


        while (hasMore) {
            let request = root !== null ? albumImagesRequest(config, root, nextPage) : loadImagesRequest(config, nextPage)
            //Log.debug("Load google items:" + JSON.stringify(request))

            const response = await fetch(request.uri, request.params).then((response) => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        Log.error("Load images error", response.body)
                        return null
                    }
                }
            )

            if (response === null) {
                return new Promise((resolve, reject) => {
                    reject("Google images load error")
                })
            }

            if (response.mediaItems === undefined) {
                return new Promise((resolve, reject) => {
                    resolve({nextPage: null, items: [], hasMore: false})
                })
            }
            count = count + response.mediaItems.length
            Log.debug("Load google items get:" + response.mediaItems.length + " total = " + count)
            const newItems = Array()
            response.mediaItems.forEach( (value: { id: string; }) => {
                const find = images.find((object) => {
                    return object.originId === value.id
                })
                if( find === undefined) {
                    newItems.push(value)
                }
            })
            Log.debug("Google item new " + newItems.length)
            realm.write(() => {
                newItems.forEach((value) => {
                    const entry = ServiceImportEntry.serviceImportEntry(ServiceType.Google, SaufotoObjectType.Image, value.id, (root === null ? '' : root), value.filename, value.baseUrl, count)
                    realm.create("ServiceImportGoogle", entry)
                })
            })

          /*  const items = Array.apply(null, Array(response.mediaItems.length)).map((v, i) => {
                let entry = response.mediaItems[i]
                return SaufotoProvider.findOrCreateImport(realm, ServiceType.Google, SaufotoObjectType.Image, entry.id, (root === null ? '' : root), entry.filename, entry.baseUrl) as unknown as ServiceImportGoogle;
            })*/
            hasMore = response.nextPageToken !== undefined
            nextPage = response.nextPageToken
        }

        //return {nextPage: response.nextPageToken, items: items, hasMore: (response.nextPageToken !== undefined) }
        return {nextPage: null, items: [], hasMore: false }
    }

    const GOOGLE_ALBUMS_ITEMS = 'https://photoslibrary.googleapis.com/v1/albums'

    export async function loadAlbums(realm:Realm, config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        let request = GOOGLE_ALBUMS_ITEMS + "?pageSize=50"
        if( page !== null ) {
            request = request + '&pageToken=' + page
        }
        Log.debug("Load google albums:" + request)
        const response = await fetch(request, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + config.accessToken
            }
        }).then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    return null
                }
            }
        )
        const items = Array.apply(null, Array(response.albums.length)).map((v, i) => {
            let entry = response.albums[i]
            let count = (entry.mediaItemsCount === null) ? 0:entry.mediaItemsCount
            return SaufotoProvider.findOrCreateImport(realm, ServiceType.Google, SaufotoObjectType.Album, entry.id, '', entry.title, entry.coverPhotoBaseUrl, count) as unknown as ServiceImportGoogle;
        })
        return {nextPage: response.nextPageToken, items: items, hasMore: (response.nextPageToken !== undefined) }
    }

    export async function getThumbsData(realm:Realm, config: ServiceTokens, object: ServiceImportEntry, size: ThumbSize): Promise<string> {

        let uri = await object.createThumb(size, object.originalUri + '=' + size, realm ).catch(async (err) =>{
            return null
        })
        if( uri === null) {
            const image = await getImage(realm, config, object.originId)
            uri =  await object.createThumb(size, image.baseUrl + '=' + size, realm )
        }
        return uri
    }

    export function albumId(realm:Realm, media:SaufotoAlbum | SaufotoImage) : string | null {
        return media.originId
    }
}
