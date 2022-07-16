
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage'

export namespace Preferences {
    export async function setItem(key: string, value: string) {
        return await RNSecureStorage.set(key, value, {accessible: ACCESSIBLE.WHEN_UNLOCKED})
    }

    export async function getItem(key: string) {
        if( await  isExists(key)) {
            return await RNSecureStorage.get(key)
        }
        return null
    }

    export async function removeItem(key: string) {
        return await RNSecureStorage.remove(key)
    }

    export async function isExists(key: string) {
        return await RNSecureStorage.exists(key)
    }
}

