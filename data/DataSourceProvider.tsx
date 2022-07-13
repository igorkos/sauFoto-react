import {authorizeWith} from "./AuthorizationProvicer";
import {ServiceType} from "./DataServiceConfig";
import {SaufotoMedia} from "./SaufotoImage";
import {DropboxProvider} from "./DropboxDataSource";
import {GoogleProvider} from "./GoogleDataSource";
import {ThumbSize} from "../constants/Images";

export const DataProviders = {
    Dropbox: {
        loadImages: DropboxProvider.loadImages,
        getThumbsData: DropboxProvider.getThumbsData
    },
    Google: {
        loadImages: GoogleProvider.loadImages,
        getThumbsData: GoogleProvider.getThumbsData
    }
}


export namespace DataSourceProvider {
    export interface LoadImagesResponse {
        items: [SaufotoMedia]
        nextPage: string
    }
    export async function loadImages(type: ServiceType, root, page): Promise<LoadImagesResponse> {
        const config = await authorizeWith(type)
        return  await DataProviders[type].loadImages(config, root, page)
    }

    export async function getThumbsData(type: ServiceType, path: string, size: ThumbSize) {
        return await DataProviders[type].getThumbsData(path, size)
    }
}
