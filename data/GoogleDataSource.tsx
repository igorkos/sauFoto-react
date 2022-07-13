import {Log} from "../hooks/log";
import {revoke} from "react-native-app-auth";
import AsyncStorage from "@react-native-community/async-storage";
import {SaufotoImage} from "./SaufotoImage";
import {authorizeWith} from "./AuthorizationProvicer";
import {ServiceType} from "./DataServiceConfig";

interface GoogleMediaListRequest{
    pageSize: number
    pageToken?:string
}

interface GoogleMediaItem{
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

interface GoogleMediaMetadata{
    creationTime: string,
    width: string,
    height: string,
    // Union field metadata can be only one of the following:
    photo: GooglePhoto,
    video: GoogleVideo
}

interface GooglePhoto{
    cameraMake: string,
    cameraModel: string,
    focalLength: number,
    apertureFNumber: number,
    isoEquivalent: number,
    exposureTime: string
}

interface GoogleVideo{
    cameraMake: string,
    cameraModel: string,
    fps: number,
    status: 'UNSPECIFIED' | 'PROCESSING' | 'READY' | 'FAILED'
}

interface GoogleMediaListResponse{
    mediaItems: [GoogleMediaItem],
    nextPageToken: string
}

const GOOGLE_MEDIA_ITEMS = 'https://photoslibrary.googleapis.com/v1/mediaItems'
export async function GoogleImages(root) {
    const config = await authorizeWith(ServiceType.Google)
    const response = await fetch(GOOGLE_MEDIA_ITEMS+"?pageSize=50", {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + config.accessToken
        }
    }).then((response) => {
            if (response.ok) {
                Log.debug("Google photos body: " + response.body)
                return response.json()
            } else {
                return null
            }
        }
    )
    Log.debug("Google photos: " + JSON.stringify(response))
    const items = Array.apply(null, Array(response.mediaItems.length)).map( (v, i) => {
        let entry = response.mediaItems[i]
        let object = {} as SaufotoImage
        object.id = entry.id
        object.type = 'image'
        object.title = entry.filename
        object.placeHolderImage = 'image_placeholder.png'
        object.originalUri = entry.baseUrl
        return object
        })
    return {nextPageToken: response.nextPageToken, items: items}
}

export function getThumbsData(path) {
    return path + '=w256-h256'
}

