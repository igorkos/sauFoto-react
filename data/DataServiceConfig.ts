const GOOGLE_OAUTH_APP_GUID = '962165832520-n4lj2iqr3bjge6kf9fp89b0rnrj6hf5r'

export enum  ServiceType{
  Dropbox = 'Dropbox',
  Google = 'Google'
}

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
    }
}
