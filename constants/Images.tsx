import * as React from "react";

const Placeholders = {
    folder: require('../assets/images/folder_blue.png'),
    image: require('../assets/images/image_placeholder.png'),
    select: require('../assets/images/asset_select_icon.png'),
    imageError: require('../assets/images/error_load_image.png'),
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
}
