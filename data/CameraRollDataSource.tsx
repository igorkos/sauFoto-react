import * as React from "react";
import * as MediaLibrary from "expo-media-library";
import {Log} from "../hooks/log";
import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {PermissionStatus} from "expo-modules-core/src/PermissionsInterface";
import {thumbData, ThumbData, thumbHeight, ThumbSize, thumbWith} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {SaufotoAlbum, SaufotoImage, SaufotoObjectType, ServiceImportCamera, ServiceImportEntry} from "./SaufotoImage";
import {ServiceTokens} from "./DataServiceConfig";
import {ServiceType} from "./ServiceType";
import {SaufotoProvider} from "./SaufotoDataSource";
import ImageResizer from 'react-native-image-resizer';

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

    export async function loadImages(realm:Realm, config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        const album = await MediaLibrary.getAlbumAsync('Camera')
        const options = page === null ? {album: album, first:50}:{album: album, first:50, after:page}
        const photosTemp = await MediaLibrary.getAssetsAsync(options)
        Log.debug("Loading Camera Roll images: " + photosTemp.assets.length)
        const items =  Array.apply(null, Array(photosTemp.assets.length)).map((v, i) => {
            return SaufotoProvider.findOrCreateImport(realm, ServiceType.Camera, SaufotoObjectType.Image, photosTemp.assets[i].id, 'Camera', photosTemp.assets[i].filename, photosTemp.assets[i].uri) as unknown as ServiceImportCamera
        })

        return {nextPage: items[items.length - 1].originId, items: items, hasMore: !(photosTemp.assets.length < 50)}
    }

    export async function getThumbsData(realm:Realm, config: ServiceTokens, object: ServiceImportEntry, size: ThumbSize): Promise<string> {
        const thumb = await object.createThumb(size, object.originalUri!, realm )
        return thumb
    }

    export async function loadAlbums(realm:Realm, config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return {nextPage: null, items: [], hasMore:false}
    }

    export function albumId(realm:Realm, media:SaufotoAlbum | SaufotoImage):  string | null{
        return media.originId
    }
}
