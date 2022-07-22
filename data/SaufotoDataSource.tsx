import {AuthConfiguration, AuthorizeResult, BaseAuthConfiguration, RevokeConfiguration} from "react-native-app-auth";
import {ServiceTokens} from "./DataServiceConfig";
import {LoadImagesResponse} from "./DataSourceProvider";
import {Log} from "../hooks/log";
import {SaufotoAlbum, SaufotoImage, SaufotoMedia, SaufotoObjectType, ServiceImportEntry} from "./SaufotoImage";
import {ThumbSize} from "../constants/Images";
import {ServiceType} from "./ServiceType";


export namespace SaufotoProvider {

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
        Log.debug("Saufoto data LoadImages", root, page)
        return {nextPage: '', items: [], hasMore:false}
    }

    export async function loadAlbums(config: ServiceTokens, root: string | null, page: string | null): Promise<LoadImagesResponse> {
        return {nextPage: null, items: [], hasMore:false}
    }

    export async function getThumbsData(config: ServiceTokens, path: string, size: ThumbSize) {
        return path
    }

    export function albumId(media:SaufotoAlbum | SaufotoImage) {
        return media.originId
    }
}
