import * as React from "react";

const Placeholders = {
    folder: require('../assets/images/folder_blue.png'),
    image: require('../assets/images/image_placeholder.png'),
};

export function getPlaceFolder(image) {
    switch (image) {
        case 'folder_blue.png' :{
            return Placeholders.folder
        }
        case 'image_placeholder.png' :{
            return Placeholders.image
        }
    }
}
