
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage'

export namespace Preferences {
    export async function setItem(key, value) {
        return await RNSecureStorage.set(key, value, {accessible: ACCESSIBLE.WHEN_UNLOCKED})
    }

    export async function getItem(key) {
        if( await  isExists(key)) {
            return await RNSecureStorage.get(key)
        }
        return null
    }

    export async function removeItem(key) {
        return await RNSecureStorage.remove(key)
    }

    export async function isExists(key) {
        return await RNSecureStorage.exists(key)
    }
}

