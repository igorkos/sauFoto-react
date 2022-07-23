import {authorize, revoke} from "react-native-app-auth";
import {CameraProvider} from "./CameraRollDataSource";
import {TestProvider} from "./ImageDataSource";
import {ServiceType} from "./ServiceType";

const GOOGLE_OAUTH_APP_GUID = '962165832520-n4lj2iqr3bjge6kf9fp89b0rnrj6hf5r'

export interface ServiceTokens {
    clientId: string,
    accessToken: string,
    accessTokenExpiresAt: string,
    refreshToken?: string,
    clientSecret?: string,
    issuer?: string,
}

export const ServiceConfig = {
    Dropbox: {
        clientId: 'e7vfy8jyt9ees59',
        clientSecret: 'qcvhtg8zr1bwlow',
        redirectUrl: 'com.saufoto://oauth',
        scopes: ['files.metadata.read', 'files.content.read', 'account_info.read', 'file_requests.read'],
        serviceConfiguration: {
            authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
            tokenEndpoint: `https://www.dropbox.com/oauth2/token`,
        },
        issuer: 'https://dropbox.com',
    },
    Google: {
        issuer: 'https://accounts.google.com',
        clientId: GOOGLE_OAUTH_APP_GUID +'.apps.googleusercontent.com',
        redirectUrl: 'com.googleusercontent.apps.'+ GOOGLE_OAUTH_APP_GUID +':/oauth2redirect/google',
        scopes: ['openid', 'profile','https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata', 'https://www.googleapis.com/auth/photoslibrary','https://www.googleapis.com/auth/photoslibrary.readonly'],
        clientSecret: '',
    },
    Camera: {
        issuer: 'camera',
        clientId: 'saufoto.com',
        redirectUrl: null,
        clientSecret: 'saufoto.com',
        scopes: []
    },
    Saufoto: {
        issuer: 'test',
        clientId: 'saufoto.com',
        redirectUrl: null,
        clientSecret: 'saufoto.com',
        scopes: []
    }
}

export const ServiceConfigAuthMethods = {
    Dropbox: {
        authorize: authorize,
        revoke: revoke,
    },
    Google: {
        authorize: authorize,
        revoke: revoke,
    },
    Camera: {
        authorize: CameraProvider.authorize,
        revoke: CameraProvider.revoke,
    },
    Saufoto: {
        authorize: TestProvider.authorize,
        revoke: TestProvider.revoke,
    }
}

export interface AuthError {
    provider: ServiceType
    reason?: string
}
