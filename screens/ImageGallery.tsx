import * as React from 'react';
import { RootTabScreenProps } from './drawer/types';
import {photosListView} from "./drawer/PhotosCollectionList";
import {ServiceType} from "../data/DataServiceConfig";

export default function SaufotoGalleryScreen({ navigation }: RootTabScreenProps<'GalleryScreen'>) {
    return photosListView(navigation, ServiceType.Test)
}
