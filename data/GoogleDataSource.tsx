import {Log} from "../hooks/log";
import {revoke} from "react-native-app-auth";
import AsyncStorage from "@react-native-community/async-storage";
import {saufotoImage, SaufotoImage} from "./SaufotoImage";
import {authorizeWith} from "./AuthorizationProvicer";
import {ServiceType} from "./DataServiceConfig";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";

export namespace GoogleProvider {
    interface GoogleMediaListRequest {
        pageSize: number
        pageToken?: string
    }

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

    interface GoogleMediaListResponse {
        mediaItems: [GoogleMediaItem],
        nextPageToken: string
    }

    const GOOGLE_MEDIA_ITEMS = 'https://photoslibrary.googleapis.com/v1/mediaItems'

    export async function loadImages(config, root, page): Promise<LoadImagesResponse> {
        let request = GOOGLE_MEDIA_ITEMS + "?pageSize=50"
        if( page !== null ) {
            request = request + '&pageToken=' + page
        }
        Log.debug("Load google items:" + request)
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
        const items = Array.apply(null, Array(response.mediaItems.length)).map((v, i) => {
            let entry = response.mediaItems[i]
            let object = saufotoImage()
            object.id = entry.id
            object.title = entry.filename
            object.originalUri = entry.baseUrl
            return object
        })
        return {nextPage: response.nextPageToken, items: items, hasMore: (response.nextPageToken !== undefined) }
    }

    export async function getThumbsData(path, size: ThumbSize) {
        return path + '=' + size
    }

}
