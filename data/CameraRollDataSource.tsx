import * as React from "react";
import * as MediaLibrary from "expo-media-library";
import {Log} from "../hooks/log";


export async function CameraRollImages() {
    const album = await MediaLibrary.getAlbumAsync('Camera')
    const photosTemp = await MediaLibrary.getAssetsAsync({album: album})
    Log.debug("Loading Camera Roll images:" + photosTemp)
    return Array.apply(null, Array(photosTemp.assets.length)).map((v, i) => {
        return {
            id: photosTemp.assets[i].id,
            image: photosTemp.assets[i].uri
        };
    })
};
