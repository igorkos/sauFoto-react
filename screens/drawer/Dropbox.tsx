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
import * as Progress from 'react-native-progress';
import {getPlaceFolder} from "../../constants/Images";
import {List, Item} from 'linked-list'

class Folder extends Item {
    readonly value?: string;

    constructor(value) {
        super()
        this.value = value
    }

    toString() {
        return this.value
    }
}

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

    const showModalFunction = (id) => {
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <FlatList
                    data={dataSource}
                    renderItem={({item}) => (
                        <View style={styles.imageContainerStyle}>
                            <TouchableOpacity
                                key={item.id}
                                style={{flex: 1}}
                                onPress={() => {
                                    showModalFunction(item);
                                }}>
                                <ImageSource item={item}/>
                            </TouchableOpacity>
                        </View>
                    )}
                    //Setting the number of column
                    numColumns={3}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </SafeAreaView>
    );
}

function imageUri(source): string {
    const [imageSource, setImageSource] = useState(null);
    const fetchUri = async (path) => {
        await getThumbsData(path).then( (blob) => {
            const fileReaderInstance = new FileReader();
            fileReaderInstance.onload = () => {
                const data: string = fileReaderInstance.result
                const uri = data.replace('application/octet-stream', 'image/jpeg')
                Log.debug("Get Dropbox image as data url for: '" + source + "'");
                setImageSource(uri);
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



const ImageSource = (item) => {
    const media = item.item
    if (media.type !== 'album') {
        const uri = imageUri(media.originalUri)
        Log.debug("Render image  '" + media.originalUri + "'")
        if( uri !== null) {
            return (<Image
                style={styles.imageStyle}
                source={{uri}}
            />)
        } else {
            Log.debug("Render Album  '" + media.originalUri + "'")
            return (
                <ImageBackground
                    style={styles.imageStyle}
                    source={getPlaceFolder(media.placeHolderImage)}>
                    <Progress.Circle size={30} indeterminate={true}/>
                </ImageBackground>
            )
        }
    } else {
        return (
            <View style={{alignItems: 'center', flex: 1,}}>
                <Image
                    style={styles.imageStyle}
                    source={getPlaceFolder(media.placeHolderImage)}
                />
                <Caption style={styles.caption}>{media.title}</Caption>
            </View>)
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    caption: {
        justifyContent: 'center',
        fontSize: 14,
        lineHeight: 14,
    },
    imageContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
    },
    imageStyle: {
        height: 120,
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
