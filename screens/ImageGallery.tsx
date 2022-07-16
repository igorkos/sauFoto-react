import * as React from 'react';
import { RootTabScreenProps } from './drawer/types';
import {photosListView} from "./drawer/PhotosCollectionList";
import {ServiceType} from "../data/ServiceType";

export default function SaufotoGalleryScreen({ navigation, route }: RootTabScreenProps<'GalleryScreen'>) {
    return photosListView(navigation, route, ServiceType.Test, false)
}
