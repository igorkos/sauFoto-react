import {Log} from "../hooks/log";
import {authorize, AuthorizeResult, logout, revoke} from "react-native-app-auth";
import {ServiceConfig, ServiceTokens, ServiceType} from "./DataServiceConfig";
import {Preferences} from "./PreferenceStorage";

function processAuthResponse(type: ServiceType, response: AuthorizeResult) : ServiceTokens {
    return {
        clientId: ServiceConfig[type].clientId,
        accessToken: response.accessToken,
        accessTokenExpiresAt: response.accessTokenExpirationDate,
        refreshToken: response.refreshToken,
        clientSecret: ServiceConfig[type].clientSecret,
        issuer: ServiceConfig[type].issuer
    }
}

async function isAuthorized(type: ServiceType) {
    const token = await Preferences.getItem(type+'Token')
    if(token != null) {
        let config = JSON.parse(token)
        if (new Date(config.accessTokenExpiresAt).getTime() < Date.now()) {
            return false
        }
    }
    Log.debug(type+ " is authorised :" + token === null ? 'false':'true')
    return token !== null
}

export async function authorizeWith(type: ServiceType): Promise<ServiceTokens>{
    if( await isAuthorized(type) === false ) {
        await authorize(ServiceConfig[type]).then( (result) => {
            Log.debug(type +" auth success")
            const tokens = processAuthResponse(type, result)
            Preferences.setItem(type+'Token', JSON.stringify(tokens))
        });
    }
    return await  Preferences.getItem(type+'Token').then(req => JSON.parse(req))
}

export async function reset(type: ServiceType) {
    const token = await Preferences.getItem(type+'Token').then(req => JSON.parse(req))
    if(token !== null) {
        const config = {
            issuer: token.issuer,
            clientId: token.clientId,
            redirectUrl: ServiceConfig[type].redirectUrl,
            scopes: ServiceConfig[type].scopes,
        };

        const result = await revoke(config, {
            tokenToRevoke: token.accessToken,
            includeBasicAuth: true,
            sendClientId: true,
        }).then((result) => {
            Log.debug(type +" logout:" + JSON.stringify(result))
            Preferences.removeItem(type+'Token')
        }).catch((reason) => {
            Log.error(type +" logout:" + JSON.stringify(reason))
        })
    }
}
