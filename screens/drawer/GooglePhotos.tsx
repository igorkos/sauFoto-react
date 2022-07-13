import * as React from "react";
import { Text, View } from '../../components/Themed';
import {useEffect, useState} from "react";
import {Log} from "../../hooks/log";
import {getThumbsData, GoogleImages} from "../../data/GoogleDataSource";
import {Folder, photosListView} from "./PhotosCollectionList";


export default function GooglePhotosScreen({ navigation }) {
    const [dataSource, setDataSource] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);

    const fetchData = async (root) => {
        return await GoogleImages(currentPage).then( (images) => {
            Log.debug("Google images: '" + images + "'");
            setDataSource(images.items)
            setCurrentPage(images.nextPageToken)
        })
    }

    useEffect(() => {
        fetchData(null).catch((err) => {
            Log.error("Loading Google images error:" + err)
        });
    }, []);

    const onItemSelected = (id) => {
        navigation.navigate('ImageCarousel', {selected: id, collection: dataSource})
    };

    return photosListView(dataSource, onItemSelected, imageUri)
};

function imageUri(source) {
    return getThumbsData(source)
}
