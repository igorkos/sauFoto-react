import * as React from "react";
import {Platform, BackHandler} from 'react-native';
import {useEffect, useState} from "react";
import {Log} from "../../hooks/log";
import {List} from 'linked-list'
import {Folder, photosListView} from "./PhotosCollectionList";
import {DataSourceProvider} from "../../data/DataSourceProvider";
import {ServiceType} from "../../data/DataServiceConfig";
import {ThumbSize} from "../../constants/Images";



export default function DropboxScreen({ navigation, route }) {
    const [dataSource, setDataSource] = useState([]);
    const [currentFolder, setSourceFolder] = useState(new List(new Folder(null),new Folder('')));

    if(Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', function () {
            if (currentFolder.tail.prev === null) {
                navigation.goBack();
                return false;
            }
            currentFolder.tail.detach()
            setSourceFolder(currentFolder)
            fetchData(currentFolder.tail.value).catch((err) => {
                Log.error("Loading Dropbox images error:" + err)
            });
            return true;
        });
    }
    const fetchData = async (root) => {
        return await DataSourceProvider.loadImages(ServiceType.Dropbox, root, '').then( (photos) => {
                Log.debug("Loaded Dropbox images from: '" + root + "'");
                setDataSource(photos.items)
            })
    }

    useEffect(() => {
        fetchData(currentFolder.tail.value).catch((err) => {
            Log.error("Loading Dropbox images error:" + err)
        });
    }, []);

    const onItemSelected = (id) => {
        if(id.type === 'album') {
            currentFolder.append(new Folder(id.originalUri))
            setSourceFolder(currentFolder)
            Log.debug("Load dropbox folder:" + id.originalUri)
            fetchData(id.originalUri).catch((err) => {
                Log.error("Loading Dropbox images error:" + err)
            });
        } else {
            navigation.navigate('ImageCarousel', {selected: id, collection: dataSource})
        }
    };

    return photosListView(dataSource, route, onItemSelected, imageUri)
}

function imageUri(source): string {
    const [imageSource, setImageSource] = useState(null);
    const fetchUri = async (path) => {
        await DataSourceProvider.getThumbsData(ServiceType.Dropbox, path, ThumbSize.THUMB_256).then( (blob) => {
            const fileReaderInstance = new FileReader();
            fileReaderInstance.onload = () => {
                const data: string | ArrayBuffer = fileReaderInstance.result
                if(data instanceof String) {
                    const uri = data.replace('application/octet-stream', 'image/jpeg')
                    Log.debug("Get Dropbox image as data url for: '" + source + "'");
                    setImageSource(uri);
                }
            }
            fileReaderInstance.readAsDataURL(blob);
        })
    }
    useEffect(() => {
        fetchUri(source).catch((err) => {
            Log.error("Dropbox image data " + source + " error:" + err)
            setImageSource(null)
        });
    },[])
    return imageSource
}






