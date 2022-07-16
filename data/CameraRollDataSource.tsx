import * as React from "react";
import * as MediaLibrary from "expo-media-library";
import {Log} from "../hooks/log";
import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {PermissionStatus} from "expo-modules-core/src/PermissionsInterface";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {SaufotoAlbum, SaufotoImage, saufotoImage} from "./SaufotoImage";
import {ServiceTokens} from "./DataServiceConfig";


export namespace CameraProvider {

    export async function authorize(config: AuthConfiguration): Promise<AuthorizeResult> {
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

    export function revoke(config: BaseAuthConfiguration, revokeConfig: RevokeConfiguration): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve()
        })
    }

    export async function loadImages(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        const album = await MediaLibrary.getAlbumAsync('Camera')
        const options = page === null ? {album: album, first:50}:{album: album, first:50, after:page}
        const photosTemp = await MediaLibrary.getAssetsAsync(options)
        Log.debug("Loading Camera Roll images:" + photosTemp)
        const items =  Array.apply(null, Array(photosTemp.assets.length)).map((v, i) => {
            const object = saufotoImage()
            object.id = photosTemp.assets[i].id
            object.title = photosTemp.assets[i].filename
            object.originalUri = photosTemp.assets[i].uri
            return object
        })

        return {nextPage: items[items.length - 1].id, items: items, hasMore: !(photosTemp.assets.length < 50)}
    }

    export async function getThumbsData(config: ServiceTokens, path: string, size: ThumbSize) {
        return path
    }

    export async function loadAlbums(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return new Promise((resolve, reject) => {
            resolve({nextPage: null, items: [], hasMore:false})
        })
    }

    export function albumId(media:SaufotoAlbum | SaufotoImage) {
        return media.id
    }
}
