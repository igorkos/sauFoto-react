import {Log} from "../utils/log";
import {SaufotoImage, SaufotoObjectType} from "./watermelon/SaufotoImage";
import {ThumbSize} from "../styles/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {ServiceTokens} from "./DataServiceConfig";
import {ServiceType} from "./ServiceType";
import {ImportObject} from "./watermelon/ImportObject";
import {addToTable} from "./watermelon/DataSourceUtils";
import {cacheImage} from "../utils/FileUtils";
import {Preferences} from "./PreferenceStorage";

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

    function getImagesSearch(config: ServiceTokens, endDate: string , page:string | null){
        let request = GOOGLE_MEDIA_ITEMS + ":search"
        let body
        const start = new Date()
        const end = new Date(endDate)
        const filter = {
            dateFilter:{
                ranges:{
                    startDate: {
                        year: start.getFullYear(),
                            month: start.getMonth(),
                            day: start.getDay()
                    },
                    endDate:{
                        year: end.getFullYear(),
                            month: end.getMonth(),
                            day: end.getDay()
                    }
                }
            }
        }
        if(page === null ) {
            body = JSON.stringify({
                pageSize: 50,
                filters:{
                    dateFilter:{filter}
                }
            })
        } else {
            body = JSON.stringify({
                pageSize: 50,
                pageToken:page,
                filters:{
                    dateFilter:{filter}
                }
            })
        }
        return {uri: request, params: {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + config.accessToken
                },
                body: body
            }}
    }

    async function getImage(config: ServiceTokens, id: string): Promise<GoogleMediaItem> {
        let request = getImageRequest(config, id)
        return await fetch(request.uri, request.params).then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    Log.error("Load image error:", response.status)
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
        const isAllFetched =  await Preferences.getItem(ServiceType.Google +'imageImportComplete') === 'true'

        while (hasMore) {
            let response: GoogleMediaListResponse
            if(isAllFetched) {
                const end = await Preferences.getItem(ServiceType.Google +'imageImportDate')
                const request = getImagesSearch(config, end!, page)
                response = await fetch(request.uri, request.params).then((response) => {
                        if (response.ok) {
                            return response.json()
                        } else {
                            Log.error("Load images error", response.status)
                            return null
                        }
                    }
                )
            } else {
                const request = root !== null ? albumImagesRequest(config, root, nextPage) : loadImagesRequest(config, nextPage)
                //Log.debug("Load google items:" + JSON.stringify(request))
                response = await fetch(request.uri, request.params).then((response) => {
                        if (response.ok) {
                            return response.json()
                        } else {
                            Log.error("Load images error", response.status)
                            return null
                        }
                    }
                )
            }
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

            if(page === null) {
                await Preferences.setItem(ServiceType.Google +'imageImportDate', response.mediaItems[0].mediaMetadata.creationTime)
            }

            count += await addToTable(response.mediaItems, ServiceType.Google, (root === null ? '' : root),
                (item: any) => { return SaufotoObjectType.Image }, 'filename', 'productUrl', 'baseUrl', ThumbSize.THUMB_128)

            Log.debug("Added Google  entries: " + count)

            hasMore = response.nextPageToken !== undefined
            nextPage = response.nextPageToken
        }
        Log.debug("Google items load complete")
        await Preferences.setItem(ServiceType.Google +'imageImportComplete', 'true')
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

            count += await addToTable(response.albums, ServiceType.Google, (root === null ? '' : root),
                (item: any) => { return SaufotoObjectType.Album }, 'title', 'productUrl', 'coverPhotoBaseUrl', ThumbSize.THUMB_256, 'coverPhotoMediaItemId','mediaItemsCount')

            Log.debug("Added Google  entries: " + count)

            hasMore = response.nextPageToken !== undefined
            nextPage = response.nextPageToken
        }
        Log.debug("Google albums load complete")
        return {nextPage: nextPage, items: [], hasMore:false }
    }

    function addMinutes(minutes: number): Date {
        return new Date(new Date().getTime() + minutes*60000);
    }

    export async function getThumbsData(config: ServiceTokens, object: ImportObject|SaufotoImage, size: ThumbSize): Promise<string> {
        let importObject:ImportObject
        if(object instanceof SaufotoImage ) {
            importObject =  await object.getImport()
        } else {
            importObject = object
        }

        const image = await getImage(config, importObject.originId)
        return await importObject.createThumb(size,  image.baseUrl + '=' + size )
    }

    export async function getImageData( config: ServiceTokens, object: SaufotoImage): Promise<string> {
        const imp = await object.getImport()
        const image = await getImage(config, imp.originId)
        const mediaInfo = {
            width: +image.mediaMetadata.width,
            height: +image.mediaMetadata.height,
            creationTime: image.mediaMetadata.creationTime,
        }
        await object.setMediaInfo(mediaInfo)
        const uri = await cacheImage(image.baseUrl, mediaInfo.width, mediaInfo.height)
        await object.setLocalImageFile(uri)
        return uri
    }

    export function albumId(media:ImportObject|SaufotoImage) : string | null {
        return (media as ImportObject).originId
    }
}
