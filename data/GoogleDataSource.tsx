import {Log} from "../hooks/log";
import {SaufotoAlbum, SaufotoImage, SaufotoObjectType} from "./SaufotoImage";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {ServiceTokens} from "./DataServiceConfig";
import {ServiceType} from "./ServiceType";
import {ImportObject} from "./watermelon/ImportObject";
import {addToTable} from "./watermelon/DataSourceUtils";

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
        title: string,
        productUrl: string,
        mediaItemsCount: string,
        coverPhotoBaseUrl: string,
        coverPhotoMediaItemId: string,
    }

    interface GoogleMediaListResponse {
        mediaItems: [GoogleMediaItem],
        nextPageToken: string
    }

    interface GoogleAlbumsListResponse {
        albums: [GoogleAlbum],
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

    async function getImage(config: ServiceTokens, id: string): Promise<GoogleMediaItem> {
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

    export async function loadImages(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        let hasMore = true
        let nextPage = page
        let count = 0

        Log.debug("Google items load start")

        while (hasMore) {
            let request = root !== null ? albumImagesRequest(config, root, nextPage) : loadImagesRequest(config, nextPage)
            //Log.debug("Load google items:" + JSON.stringify(request))

            const response: GoogleMediaListResponse = await fetch(request.uri, request.params).then((response) => {
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
                return new Promise((resolve) => {
                    resolve({nextPage: null, items: [], hasMore: false})
                })
            }

            count += await addToTable('ImportObject', response.mediaItems, ServiceType.Google, (root === null ? '' : root),
                (item: any) => { return SaufotoObjectType.Image }, 'filename', 'baseUrl')

            Log.debug("Added Google  entries: " + count)

            hasMore = response.nextPageToken !== undefined
            nextPage = response.nextPageToken
        }
        Log.debug("Google items load complete")
        return {nextPage: null, items: [], hasMore: false }
    }

    const GOOGLE_ALBUMS_ITEMS = 'https://photoslibrary.googleapis.com/v1/albums'

    export async function loadAlbums( config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        let hasMore = true
        let nextPage = page
        let count = 0

        Log.debug("Google albums load start")

        while (hasMore) {
            let request = GOOGLE_ALBUMS_ITEMS + "?pageSize=50"
            if( page !== null ) {
                request = request + '&pageToken=' + page
            }
            Log.debug("Load google albums:" + request)
            const response: GoogleAlbumsListResponse = await fetch(request, {
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

            count += await addToTable('ImportObject', response.albums, ServiceType.Google, (root === null ? '' : root),
                (item: any) => { return SaufotoObjectType.Album }, 'title', 'coverPhotoBaseUrl', 'coverPhotoMediaItemId', 'mediaItemsCount')

            Log.debug("Added Google  entries: " + count)

            hasMore = response.nextPageToken !== undefined
            nextPage = response.nextPageToken
        }
        Log.debug("Google albums load complete")
        return {nextPage: nextPage, items: [], hasMore:false }
    }

    export async function getThumbsData(config: ServiceTokens, object: ImportObject, size: ThumbSize): Promise<string> {
        const source = object.originalUri
        let uri = await object.createThumb(size,  source + '=' + size ).catch(async () =>{
            return null
        })
        if( uri === null) {
            const image = await getImage(config, object.originId)
            uri =  await object.createThumb(size, image.baseUrl + '=' + size)
        }
        return uri
    }

    export function albumId(media:ImportObject) : string | null {
        return media.originId
    }
}
