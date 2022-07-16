import {Log} from "../hooks/log";
import {SaufotoAlbum, saufotoAlbum, saufotoImage, SaufotoImage} from "./SaufotoImage";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";

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
    function albumImagesRequest(config, root, page) {
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

    function loadImagesRequest(config, page){
        let request = GOOGLE_MEDIA_ITEMS + "?pageSize=50"
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

    export async function loadImages(config, root, page): Promise<LoadImagesResponse> {
        let request = root !== null ?  albumImagesRequest(config, root, page):loadImagesRequest(config, page)
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

        if(response.mediaItems === undefined) {
           return  new Promise((resolve, reject) => {
                resolve({nextPage: null, items: [], hasMore: false })
            })
        }

        Log.debug("Load google items get:" +response.mediaItems.length)
        const items = Array.apply(null, Array(response.mediaItems.length)).map((v, i) => {
            let entry = response.mediaItems[i]
            let object = saufotoImage()
            object.id = entry.id
            object.title = entry.filename
            object.originalUri = entry.baseUrl
            return object
        })
        return new Promise((resolve, reject) => {
            resolve({nextPage: response.nextPageToken, items: items, hasMore: (response.nextPageToken !== undefined) })
        })
    }

    const GOOGLE_ALBUMS_ITEMS = 'https://photoslibrary.googleapis.com/v1/albums'

    export async function loadAlbums(config, root, page): Promise<LoadImagesResponse> {
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
            let object = saufotoAlbum()
            object.id = entry.id
            object.title = entry.title
            object.originalUri = entry.coverPhotoBaseUrl
            object.count = entry.mediaItemsCount
            return object
        })
        return new Promise((resolve, reject) => {
            resolve({nextPage: response.nextPageToken, items: items, hasMore: (response.nextPageToken !== undefined) })
        })
    }

    export async function getThumbsData(config, path, size: ThumbSize) {
        return path + '=' + size
    }

    export function albumId(media:SaufotoAlbum) {
        return media.id
    }
}
