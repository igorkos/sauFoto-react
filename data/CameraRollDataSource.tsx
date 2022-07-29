import * as React from "react";
import * as MediaLibrary from "expo-media-library";
import {Log} from "../utils/log";
import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {PermissionStatus} from "expo-modules-core/src/PermissionsInterface";
import {ThumbSize} from "../styles/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {SaufotoImage, SaufotoObjectType} from "./watermelon/SaufotoImage";
import {ServiceTokens} from "./DataServiceConfig";
import {ServiceType} from "./ServiceType";
import {ImportObject} from "./watermelon/ImportObject";
import {addToTable} from "./watermelon/DataSourceUtils";
import {cacheImage, cacheImageData} from "../utils/FileUtils";
import {SaufotoAlbum} from "./watermelon/SaufotoAlbum";

export namespace CameraProvider {

    export async function authorize(_config: AuthConfiguration): Promise<AuthorizeResult> {
        const result = await MediaLibrary.requestPermissionsAsync()
        const expire = result.expires === 'never' ? new Date(94670778000002): new Date(result.expires)
        if (result.status !==  PermissionStatus.GRANTED) {
            return new Promise((resolve, reject) => {
                reject("Permission denied")
            })
        }
        return {
            accessToken: result.status,
            accessTokenExpirationDate: expire.toISOString(),
            authorizationCode: "",
            authorizeAdditionalParameters: {},
            codeVerifier: "",
            idToken: "",
            refreshToken: "",
            scopes: [],
            tokenAdditionalParameters: {},
            tokenType: ""
        };
    }

    export function revoke(_config: BaseAuthConfiguration, _revokeConfig: RevokeConfiguration): Promise<void> {
        return new Promise((resolve) => {
            resolve()
        })
    }

    export async function loadImages(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        let hasMore = true
        let nextPage = page
        let count = 0

        Log.debug("Camera roll items load start")
        const album = await MediaLibrary.getAlbumAsync('Camera')

        while (hasMore) {
            const options = nextPage === null ? {album: album, first:50}:{album: album, first:50, after:nextPage}
            const photosTemp = await MediaLibrary.getAssetsAsync(options)

            Log.debug("Loading Camera Roll images: " + photosTemp.assets.length)

            count += await addToTable(photosTemp.assets, ServiceType.Camera, (root === null ? '' : root),
                (_item: any) => { return SaufotoObjectType.Image }, 'filename', 'uri')

            Log.debug("Added Camera roll  entries: " + count)

            hasMore = !(photosTemp.assets.length < 50)
            nextPage = photosTemp.assets[photosTemp.assets.length - 1].id
        }

        Log.debug("Camera roll items load complete")
        return {nextPage: null, items: [], hasMore: false }
    }

    export async function getThumbsData(config: ServiceTokens, object: ImportObject|SaufotoImage|SaufotoAlbum, size: ThumbSize): Promise<string> {
        const uri = await object.getOriginalUri()
        return await (object as ImportObject).createThumb(size, uri)
    }

    export async function getImageData( config: ServiceTokens, object: SaufotoImage): Promise<string> {
        const imp = await object.getImport()
        const photo = await MediaLibrary.getAssetInfoAsync(imp.originId)
        const mediaInfo = {
            width: photo.width,
            height: photo.height,
            creationTime: (new Date(photo.creationTime)).toDateString(),
            location: {
                latitude: photo.location?.latitude,
                longitude: photo.location?.longitude
            }
        }
        await object.setMediaInfo(mediaInfo)
        const uri = await cacheImage(await object.getOriginalUri(), mediaInfo.width, mediaInfo.height)
        await object.setLocalImageFile(uri)
        return uri
    }

    export async function loadAlbums(_config: ServiceTokens, _root: string | null, _page: string | null): Promise<LoadImagesResponse> {
        return {nextPage: null, items: [], hasMore:false}
    }

    export function albumId( media:ImportObject|SaufotoImage|SaufotoAlbum):  string | null{
        return (media as ImportObject).originId
    }
}
