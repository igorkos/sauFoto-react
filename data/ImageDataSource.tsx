import * as React from "react";
import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {ThumbSize} from "../constants/Images";
import {LoadImagesResponse} from "./DataSourceProvider";
import {SaufotoImage} from "./watermelon/SaufotoImage";
import {ServiceTokens} from "./DataServiceConfig";
import {ImportObject} from "./watermelon/ImportObject";

export namespace TestProvider {

    export async function authorize(_config: AuthConfiguration): Promise<AuthorizeResult> {
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

    export function revoke(_config: BaseAuthConfiguration, _revokeConfig: RevokeConfiguration): Promise<void> {
        return new Promise((resolve) => {
            resolve()
        })
    }

    export async function loadImages(_config: ServiceTokens, _root: string | null, _page: string | null): Promise<LoadImagesResponse> {
        return new Promise((resolve) => {
            resolve({nextPage: null, items: [], hasMore:false})
        })
    }

    export async function loadAlbums( _config: ServiceTokens, _root: string | null, _page: string | null): Promise<LoadImagesResponse> {
        return new Promise((resolve) => {
            resolve({nextPage: null, items: [], hasMore:false})
        })
    }

    export async function getThumbsData( config: ServiceTokens, object: ImportObject|SaufotoImage, size: ThumbSize): Promise<string> {
        const uri = await object.getOriginalUri()
        const thumb = await object.createThumb(size, uri )
        return new Promise( (resolve) => {
            resolve(thumb)
        })
    }

    export function albumId( _media: ImportObject|SaufotoImage):  string | null {
        return null
    }
}
