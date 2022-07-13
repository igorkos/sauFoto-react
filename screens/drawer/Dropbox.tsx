import * as React from "react";
import {
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    ImageBackground,
    Platform,
    BackHandler
} from 'react-native';

import { Text, View } from '../../components/Themed';
import {Component, FunctionComponent, useEffect, useState} from "react";
import {Log} from "../../hooks/log";
import {theme} from "../../constants/themes";
import {DropboxImages, getThumbsData, resetDropboxAccess} from "../../data/DropboxDataSource";
import {Caption, Title} from "react-native-paper";

import {getPlaceFolder} from "../../constants/Images";
import {List, Item} from 'linked-list'
import {Folder, photosListView} from "./PhotosCollectionList";



export default function DropboxScreen({ navigation }) {
    const [dataSource, setDataSource] = useState([]);
    const [currentFolder, setSourceFolder] = useState(new List(new Folder(null),new Folder('')));

    if(Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', function () {
            if (currentFolder.tail.prev === null) {
                this.goBack();
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
        return await DropboxImages(root).then( (photos) => {
                Log.debug("Loaded Dropbox images from: '" + root + "'");
                setDataSource(photos)
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

    return photosListView(dataSource, onItemSelected, imageUri)
}

function imageUri(source): string {
    const [imageSource, setImageSource] = useState(null);
    const fetchUri = async (path) => {
        await getThumbsData(path).then( (blob) => {
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






