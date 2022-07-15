import * as React from "react";
import {photosListView} from "./PhotosCollectionList";
import {ServiceType} from "../../data/DataServiceConfig";


export default function GooglePhotosScreen({ navigation }) {

    return photosListView(navigation, ServiceType.Google)
};



