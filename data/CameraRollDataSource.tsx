import * as React from "react";
import * as MediaLibrary from "expo-media-library";
import {Log} from "../hooks/log";
import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {PermissionStatus} from "expo-modules-core/src/PermissionsInterface";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {SaufotoAlbum, SaufotoImage, SaufotoObjectType, ServiceImportCamera, ServiceImportEntry} from "./SaufotoImage";
import {ServiceTokens} from "./DataServiceConfig";
import {ServiceType} from "./ServiceType";
import {SaufotoProvider} from "./SaufotoDataSource";
import {database} from "../index";
import {ImportObject} from "./watermelon/ImportObject";
import {Q} from "@nozbe/watermelondb";
import {addToTable} from "./watermelon/DataSourceUtils";

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
        let hasMore = true
        let nextPage = page
        let count = 0

        Log.debug("Camera roll items load start")
        const album = await MediaLibrary.getAlbumAsync('Camera')

        while (hasMore) {
            const options = nextPage === null ? {album: album, first:50}:{album: album, first:50, after:nextPage}
            const photosTemp = await MediaLibrary.getAssetsAsync(options)

            Log.debug("Loading Camera Roll images: " + photosTemp.assets.length)

            count += await addToTable('ImportObject', photosTemp.assets, ServiceType.Camera, (root === null ? '' : root),
                (item: any) => { return SaufotoObjectType.Image }, 'filename', 'uri')

            Log.debug("Added Camera roll  entries: " + count)


            hasMore = !(photosTemp.assets.length < 50)
            nextPage = photosTemp.assets[photosTemp.assets.length - 1].id
        }
        Log.debug("Camera roll items load complete")
        return {nextPage: null, items: [], hasMore: false }
    }

    export async function getThumbsData(config: ServiceTokens, object: ImportObject, size: ThumbSize): Promise<string> {
        const thumb = await object.createThumb(size, object.originalUri!)
        return thumb
    }

    export async function loadAlbums(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return {nextPage: null, items: [], hasMore:false}
    }

    export function albumId( media:ImportObject):  string | null{
        return media.originId
    }
}
