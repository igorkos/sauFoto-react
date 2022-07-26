import {authorizeWith, isAuthorized} from "./AuthorizationProvicer";
import {SaufotoAlbum, SaufotoImage} from "./watermelon/SaufotoImage";
import {DropboxProvider} from "./DropboxDataSource";
import {GoogleProvider} from "./GoogleDataSource";
import {ThumbSize} from "../styles/Images";
import {TestProvider} from "./ImageDataSource";
import {CameraProvider} from "./CameraRollDataSource";
import {ServiceType} from "./ServiceType";
import {ImportObject} from "./watermelon/ImportObject";
import {AuthError} from "./DataServiceConfig";
import {Log} from "../utils/log";

export const DataProviders = {
    Dropbox: {
        loadImages: DropboxProvider.loadImages,
        getThumbsData: DropboxProvider.getThumbsData,
        loadAlbums: DropboxProvider.loadAlbums,
        albumId: DropboxProvider.albumId,
        getImageData: DropboxProvider.getImageData,
    },
    Google: {
        loadImages: GoogleProvider.loadImages,
        getThumbsData: GoogleProvider.getThumbsData,
        loadAlbums: GoogleProvider.loadAlbums,
        albumId: GoogleProvider.albumId,
        getImageData: GoogleProvider.getImageData,
    },
    Camera: {
        loadImages: CameraProvider.loadImages,
        getThumbsData: CameraProvider.getThumbsData,
        loadAlbums: CameraProvider.loadAlbums,
        albumId: CameraProvider.albumId,
        getImageData: CameraProvider.getImageData,
    },
    Saufoto: {
        loadImages: TestProvider.loadImages,
        getThumbsData: TestProvider.getThumbsData,
        loadAlbums: TestProvider.loadAlbums,
        albumId: TestProvider.albumId,
        getImageData: TestProvider.getImageData,
    }
}

export interface LoadImagesResponse {
    items: Array<SaufotoImage|SaufotoAlbum|ImportObject>,
    nextPage: string | null,
    hasMore:boolean
}

export namespace DataSourceProvider {

    export async function loadImages(type: ServiceType, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        const config = await authorizeWith(type)
        return  DataProviders[type].loadImages(config, root, page)
    }

    export async function loadAlbums(type: ServiceType, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        const config = await authorizeWith(type)
        return  DataProviders[type].loadAlbums(config, root, page)
    }

    export async function getThumbsData( type: ServiceType, object: ImportObject|SaufotoImage, size: ThumbSize): Promise<string> {
        const provider = (type !== object.origin ? object.origin:type) as ServiceType
        //Log.debug("getThumbsData: request service " + type + " object service: " + object.origin + " auth: " + type)
        if( await isAuthorized(provider))
        {
            const thumbUri = object.getThumbUri(size)
            if (thumbUri != null) return thumbUri
            const config = await authorizeWith(provider)
            return DataProviders[provider].getThumbsData(config, object, size)
        }
        return new Promise( (resolve, reject) => {
            reject( {provider:provider, reason:"Not Authorized"} as AuthError)
        })
    }

    export async function getImageData( type: ServiceType, object: SaufotoImage): Promise<string> {
        const cache = await object.getLocalImageFile()
        if(cache !== null ) return cache

        const provider = (type !== object.origin ? object.origin:type) as ServiceType
        if( await isAuthorized(provider) ) {
            Log.debug("getImageData: request service " + provider + " object service: " + object.origin + " auth: " + type)
            const config = await authorizeWith(provider)
            return DataProviders[provider].getImageData(config, object)
        }
        return new Promise( (resolve, reject) => {
            reject("Not Authorized")
        })
    }

    export function albumId(type: ServiceType, media:ImportObject|SaufotoImage|SaufotoAlbum):  string | null {
        return DataProviders[type].albumId(media)
    }
}
