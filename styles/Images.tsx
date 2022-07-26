import * as React from "react";
import {Image} from "react-native";

export const Placeholders = {
    folder: require('../assets/images/folder_blue.png'),
    image: require('../assets/images/image_placeholder.png'),
    select: require('../assets/images/asset_select_icon.png'),
    imageError: require('../assets/images/error_load_image.png'),
    folderError: require('../assets/images/error_load_image.png'),
    syncPending: require('../assets/images/sync_white.png'),
};


export function getPlaceholder(image: string| null) {
    switch (image) {
        case 'folder_blue.png' :{
            return Placeholders.folder
        }
        case 'image_placeholder.png' :{
            return Placeholders.image
        }
        case 'asset_select_icon.png' :{
            return Placeholders.select
        }
        case 'error_load_image.png' :{
            return Placeholders.imageError
        }
        case 'sync_white.png' :{
            return Placeholders.syncPending
        }
    }
    return Placeholders.imageError
}

export const placeholderUri = new Map<string,string>()

export async function getPlaceholderUri() {
    // @ts-ignore
    const { default: folder } = await import("../assets/images/folder_blue.png")
    placeholderUri.set('folder_blue.png', Image.resolveAssetSource(folder).uri)
    // @ts-ignore
    const { default: image } = await import("../assets/images/image_placeholder.png")
    placeholderUri.set('image_placeholder.png', Image.resolveAssetSource(image).uri)
    // @ts-ignore
    const { default: asset } = await import("../assets/images/asset_select_icon.png")
    placeholderUri.set('asset_select_icon.png', Image.resolveAssetSource(asset).uri)
    // @ts-ignore
    const { default: error } = await import("../assets/images/error_load_image.png")
    placeholderUri.set('error_load_image.png', Image.resolveAssetSource(error).uri)
    // @ts-ignore
    const { default: sync } = await import("../assets/images/sync_white.png")
    placeholderUri.set('sync_white.png', Image.resolveAssetSource(sync).uri)
}


export enum ThumbSize {
    THUMB_32 = 'w32-h32',
    THUMB_64 = 'w64-h64',
    THUMB_128 = 'w128-h128',
    THUMB_256 = 'w256-h256',
    THUMB_480 = 'w480-h320',
    THUMB_640 = 'w640-h480',
    THUMB_960 = 'w960-h640',
    THUMB_1024 = 'w1024-h768',
    THUMB_2048 = 'w2048-h1536',
    THUMB_ORIGINAL = 'original',
}

export function thumbWith(thumb: ThumbSize): number {
    switch (thumb) {
        case ThumbSize.THUMB_32: return 32
        case ThumbSize.THUMB_64: return 64
        case ThumbSize.THUMB_128: return 128
        case ThumbSize.THUMB_256: return 256
        case ThumbSize.THUMB_480: return 480
        case ThumbSize.THUMB_640: return 640
        case ThumbSize.THUMB_960: return 960
        case ThumbSize.THUMB_1024: return 1024
        case ThumbSize.THUMB_2048: return 2048
        default: return 10000
    }
}

export function thumbHeight(thumb: ThumbSize): number {
    switch (thumb) {
        case ThumbSize.THUMB_32: return 32
        case ThumbSize.THUMB_64: return 64
        case ThumbSize.THUMB_128: return 128
        case ThumbSize.THUMB_256: return 256
        case ThumbSize.THUMB_480: return 320
        case ThumbSize.THUMB_640: return 480
        case ThumbSize.THUMB_960: return 640
        case ThumbSize.THUMB_1024: return 768
        case ThumbSize.THUMB_2048: return 1536
        default: return 10000
    }
}

export function thumbSize(width: number): ThumbSize {
    const keys = Object.keys(ThumbSize).filter((v) => isNaN(Number(v)));
    for( let key of keys) {
        // @ts-ignore
        let e = ThumbSize[key]
        if(thumbWith(e) >= width) return e
    }
    return ThumbSize.THUMB_ORIGINAL
}

export interface ThumbData{
    size: ThumbSize
    uri: string
}


