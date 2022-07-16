import * as React from "react";
import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {Log} from "../hooks/log";
import {SaufotoAlbum, SaufotoImage, saufotoImage} from "./SaufotoImage";
import {ServiceTokens} from "./DataServiceConfig";

export namespace TestProvider {

    export async function authorize(config: AuthConfiguration): Promise<AuthorizeResult> {
        return {
            accessToken: "authorized",
            accessTokenExpirationDate: new Date(94670778000002).toISOString(),
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
        Log.debug("Test data LoadImages", root, page)
        const start: string = page === null ? '0':page
        const items = Array.apply(null, Array(50)).map((v, i) => {
            let object = saufotoImage()
            object.id = i+start
            object.title = "test " + (i+start)
            object.originalUri = 'https://unsplash.it/400/800?image=' + (i + 1 + start)
            return object
        })
        return new Promise<LoadImagesResponse>((resolve, reject) => {
            resolve({nextPage: start + 50, items: items, hasMore:true})
        })
    }

    export async function loadAlbums(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return new Promise((resolve, reject) => {
            resolve({nextPage: null, items: [], hasMore:false})
        })
    }

    export async function getThumbsData(config: ServiceTokens, path: string, size: ThumbSize) {
        return new Promise((resolve, reject) => {
            resolve(path)
        })
    }

    export function albumId(media:SaufotoAlbum | SaufotoImage) {
        return media.id
    }
}
