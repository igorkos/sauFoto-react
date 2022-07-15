import {authorizeWith} from "./AuthorizationProvicer";
import {ServiceType} from "./DataServiceConfig";
import {SaufotoMedia} from "./SaufotoImage";
import {DropboxProvider} from "./DropboxDataSource";
import {GoogleProvider} from "./GoogleDataSource";
import {ThumbSize} from "../constants/Images";
import {Queue} from "../utils/Queue";
import {TestProvider} from "./ImageDataSource";
import {CameraProvider} from "./CameraRollDataSource";

export const DataProviders = {
    Dropbox: {
        loadImages: DropboxProvider.loadImages,
        getThumbsData: DropboxProvider.getThumbsData,
        loadAlbums: DropboxProvider.loadAlbums,
    },
    Google: {
        loadImages: GoogleProvider.loadImages,
        getThumbsData: GoogleProvider.getThumbsData,
        loadAlbums: GoogleProvider.loadAlbums,
    },
    Camera: {
        loadImages: CameraProvider.loadImages,
        getThumbsData: CameraProvider.getThumbsData,
        loadAlbums: CameraProvider.loadAlbums,
    },
    Test: {
        loadImages: TestProvider.loadImages,
        getThumbsData: TestProvider.getThumbsData,
        loadAlbums: TestProvider.loadAlbums,
    }
}

export interface LoadImagesResponse {
    items: [],
    nextPage: string,
    hasMore:boolean
}

export namespace DataSourceProvider {

    export async function loadImages(type: ServiceType, root, page): Promise<LoadImagesResponse> {
        const config = await authorizeWith(type)
        return  await DataProviders[type].loadImages(config, root, page)
    }

    export async function loadAlbums(type: ServiceType, root, page): Promise<LoadImagesResponse> {
        const config = await authorizeWith(type)
        return  await DataProviders[type].loadAlbums(config, root, page)
    }
    export async function getThumbsData(type: ServiceType, path: string, size: ThumbSize) {
        return await DataProviders[type].getThumbsData(path, size)
    }
}
