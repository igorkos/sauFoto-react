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
        imageLoadQueue: new Queue(),
    },
    Google: {
        loadImages: GoogleProvider.loadImages,
        getThumbsData: GoogleProvider.getThumbsData,
        imageLoadQueue: new Queue(),
    },
    Camera: {
        loadImages: CameraProvider.loadImages,
        getThumbsData: CameraProvider.getThumbsData,
        imageLoadQueue: new Queue(),
    },
    Test: {
        loadImages: TestProvider.loadImages,
        getThumbsData: TestProvider.getThumbsData,
        imageLoadQueue: new Queue(),
    }
}

export interface LoadImagesResponse {
    items: [SaufotoMedia],
    nextPage: string,
    hasMore:boolean
}

export namespace DataSourceProvider {

    export function scheduleLoading(type: ServiceType, root) {
        const queue = DataProviders[type].imageLoadQueue
        queue.push({root:root})
    }

    export function isLoading(type: ServiceType) {
        return DataProviders[type].imageLoadQueue.length > 0
    }

    export async function loadImages(type: ServiceType, root, page): Promise<LoadImagesResponse> {
        const config = await authorizeWith(type)
        return  await DataProviders[type].loadImages(config, root, page).then((items) =>{
            DataProviders[type].imageLoadQueue.shift()
            return items
        })
    }

    export async function getThumbsData(type: ServiceType, path: string, size: ThumbSize) {
        return await DataProviders[type].getThumbsData(path, size)
    }
}
