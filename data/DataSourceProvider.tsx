import {authorizeWith, isAuthorized} from "./AuthorizationProvicer";
import {SaufotoAlbum, SaufotoImage} from "./SaufotoImage";
import {DropboxProvider} from "./DropboxDataSource";
import {GoogleProvider} from "./GoogleDataSource";
import {ThumbSize} from "../constants/Images";
import {TestProvider} from "./ImageDataSource";
import {CameraProvider} from "./CameraRollDataSource";
import {ServiceType} from "./ServiceType";
import {ImportObject} from "./watermelon/ImportObject";

export const DataProviders = {
    Dropbox: {
        loadImages: DropboxProvider.loadImages,
        getThumbsData: DropboxProvider.getThumbsData,
        loadAlbums: DropboxProvider.loadAlbums,
        albumId: DropboxProvider.albumId,
    },
    Google: {
        loadImages: GoogleProvider.loadImages,
        getThumbsData: GoogleProvider.getThumbsData,
        loadAlbums: GoogleProvider.loadAlbums,
        albumId: GoogleProvider.albumId,
    },
    Camera: {
        loadImages: CameraProvider.loadImages,
        getThumbsData: CameraProvider.getThumbsData,
        loadAlbums: CameraProvider.loadAlbums,
        albumId: CameraProvider.albumId,
    },
    Saufoto: {
        loadImages: TestProvider.loadImages,
        getThumbsData: TestProvider.getThumbsData,
        loadAlbums: TestProvider.loadAlbums,
        albumId: TestProvider.albumId,
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

    export async function getThumbsData( type: ServiceType, object: ImportObject, size: ThumbSize): Promise<string> {
        if( await isAuthorized(type) ) {
            const thumbUri = object.getThumbUri(size)
            if (thumbUri != null) return thumbUri
            const config = await authorizeWith(type)
            return DataProviders[type].getThumbsData(config, object, size)
        }
        return new Promise( (resolve, reject) => {
            reject("Not Authorized")
        })
    }

    export function albumId(type: ServiceType, media:ImportObject):  string | null {
        return DataProviders[type].albumId(media)
    }
}
