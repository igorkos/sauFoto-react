import * as React from "react";
import ImageResizer from "react-native-image-resizer";
import {ServiceImportEntry} from "../data/SaufotoImage";
import {LoadImagesResponse} from "../data/DataSourceProvider";

export const Placeholders = {
    folder: require('../assets/images/folder_blue.png'),
    image: require('../assets/images/image_placeholder.png'),
    select: require('../assets/images/asset_select_icon.png'),
    imageError: require('../assets/images/error_load_image.png'),
    syncPending: require('../assets/images/sync_white.png'),
};


export function getPlaceFolder(image: string| null) {
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

export function thumbData(size: ThumbSize, uri: string): string {
    return JSON.stringify({size:size, uri:uri})
}

export async function thumbForObject(realm:Realm, object: ServiceImportEntry, uri:string,   size: ThumbSize): Promise<string> {
    for (let entry of object.thumbs) {
        const thumb = JSON.parse(entry) as ThumbData
        if( thumb.size == size) return new Promise<string>((resolve, reject) => {
            resolve(thumb.uri)
        })
    }
    const result = await ImageResizer.createResizedImage(uri, thumbWith(size), thumbHeight(size), 'JPEG', 100, 0)
    realm.write(() => {
        object.thumbs.push(thumbData(size, result.uri))
    })
    return result.uri
}
