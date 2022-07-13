import * as React from "react";
import {useEffect, useState} from "react";
import {Log} from "../../hooks/log";
import {photosListView} from "./PhotosCollectionList";
import {DataSourceProvider} from "../../data/DataSourceProvider";
import {ServiceType} from "../../data/DataServiceConfig";
import {ThumbSize} from "../../constants/Images";


export default function GooglePhotosScreen({ navigation }) {
    const [dataSource, setDataSource] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);

    const fetchData = async (root) => {
        return await DataSourceProvider.loadImages(ServiceType.Google, null, currentPage).then( (images) => {
            Log.debug("Google images: '" +  JSON.stringify(images) + "'");
            setDataSource(images.items)
            setCurrentPage(images.nextPage)
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
    return DataSourceProvider.getThumbsData(ServiceType.Google, source, ThumbSize.THUMB_256)
}
