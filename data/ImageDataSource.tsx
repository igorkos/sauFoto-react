import * as React from "react";
import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {Log} from "../hooks/log";
import {saufotoImage} from "./SaufotoImage";

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

    export async function loadImages(config, root, page): Promise<LoadImagesResponse> {
        Log.debug("Test data LoadImages", root, page)
        const items = Array.apply(null, Array(50)).map((v, i) => {
            let object = saufotoImage()
            object.id = i+page
            object.title = "test " + (i+page)
            object.originalUri = 'https://unsplash.it/400/800?image=' + (i + 1 + page)
            return object
        })
        return new Promise((resolve, reject) => {
            resolve({nextPage: page + 50, items: items, hasMore:true})
        })
    }

    export async function getThumbsData(path, size: ThumbSize) {
        return new Promise((resolve, reject) => {
            resolve(path)
        })
    }
}
