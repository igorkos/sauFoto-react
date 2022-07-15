import {Log} from "../../hooks/log";
import {
    BackHandler,
    FlatList,
    Image,
    ImageBackground,
    Platform,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import {getPlaceFolder, ThumbSize} from "../../constants/Images";
import {screenWidth, View, ProgressCircle} from "../../components/Themed";
import {Caption} from "react-native-paper";
import * as React from "react";
import {theme} from "../../constants/themes";
import {Item} from "linked-list";
import {useEffect, useState} from "react";
import {DataSourceProvider} from "../../data/DataSourceProvider";
import {ServiceType} from "../../data/DataServiceConfig";
import Colors from "../../constants/Colors";
import FastImage from 'react-native-fast-image';
import {SaufotoMedia} from "../../data/SaufotoImage";
import {MediaContext} from "../../navigation/DrawerNavigator";

export class Folder extends Item {
    readonly value?: string;

    constructor(value) {
        super()
        this.value = value
    }

    toString() {
        return this.value
    }
}
const PubSub = require('pubsub-js');

export const photosListView = (navigation, type:ServiceType) => {
    const {importGallery} = React.useContext(MediaContext);
    const {importTo} = React.useContext(MediaContext);

    const [dataSource, setDataSource] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);
    const [nextPage, setNextPage] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [events, setEvent] = useState('');

    const menuSubscriber =  (msg, data) => {
        setEvent(data)
    };

    if(Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', function () {
            setNextPage(0)
            return false;
        });
    }

    const updateDataSource = (images) => {
        Log.debug(type +" get images page: " + nextPage);
        if (currentPage == null) {
            setDataSource(images.items)
        } else {
            const items =  dataSource.concat(images.items)
            setDataSource(items)
        }
        setCurrentPage(images.nextPage)
        setLoading(false)
        setHasMore(images.hasMore)
        if( nextPage > 0 ) {
            setNextPage(nextPage - 1)
        }
    }

    const imageUri = async (source) => {
        return await DataSourceProvider.getThumbsData(type, source, ThumbSize.THUMB_256)
    }

    const fetchData = async (root) => {
        setLoading(true)
        return await DataSourceProvider.loadImages(type, root, currentPage)
    }

    useEffect(() => {
        switch (events) {
            case 'importToGallery' : {
                Log.debug("PhotosListView -> importToGallery selected" + JSON.stringify(dataSource))
                const toImport = dataSource.filter((value, index, array) => {
                    return value.selected
                })
                importGallery(toImport)
            }
            case 'importToAlbum': {

            }
        }
        setEvent('')
    },[events])

    useEffect(() => {
        Log.debug(type + " nextPage event page: " + nextPage)
        if(hasMore && !isLoading && nextPage > 0) {
            fetchData(null).then((images) => {
                updateDataSource(images)
            }).catch((err) => {
                Log.error("Loading " + type + "images error:" + err)
            });
        }
    }, [nextPage]);

    useEffect(() => {
        Log.debug(type + " isLoading event page: " + nextPage + " isLoading: " + isLoading)
        if(!isLoading && nextPage > 0 ) {
            fetchData(null).then((images) => {
                updateDataSource(images)
            }).catch((err) => {
                Log.error("Loading " + type + "images error:" + err)
            });
        }
    }, [isLoading]);

    useEffect(() => {
        Log.debug(type + " global event page: " + nextPage + " isLoading: " + isLoading)
        fetchData(null).then((images) => {
            updateDataSource(images)
        }).catch((err) => {
            Log.error("Loading " + type + "images error:" + err)
        });
        const token = PubSub.subscribe(type +'Menu', menuSubscriber);
    }, []);

    const onItemSelected = (item) => {
        item.selected = !item.selected
        //navigation.navigate('ImageCarousel', {selected: item.id, collection: dataSource})
    };

    const onMomentumScrollBegin = (syntheticEvent) => {
        const event = syntheticEvent.nativeEvent
        if (event.velocity.y < 0) {
            const contentHeight = event.contentSize.height
            const contentOffset = event.contentOffset.y
            const screenHeight = event.layoutMeasurement.height
            const pagesToLoad = Math.ceil((contentHeight - contentOffset)/screenHeight)
            Log.debug("onMomentumScrollBegin event pages to load: " + pagesToLoad)
            if( pagesToLoad < 8 && (pagesToLoad - nextPage) > 0) {
                setNextPage(pagesToLoad - nextPage )
            }
        }
    }
    const onEndReached = (event) => {
        Log.debug("onEndReached event: " + event )
        setNextPage(nextPage + 1 )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <FlatList
                    data={dataSource}
                    extraData={hasMore}
                    getItemLayout={(data, index) => (
                        {length: 120, offset: 120 * index, index}
                    )}
                    renderItem={({item}) => (
                        <View style={styles.imageContainerStyle}>
                            <TouchableOpacity
                                key={item.id}
                                style={{flex: 1}}
                                onPress={() => {
                                    onItemSelected(item);
                                }}>
                                <ImageSource item={item} getThumbUri={imageUri}/>
                            </TouchableOpacity>
                        </View>
                    )}
                    numColumns={3}
                    initialNumToRender={21}
                    onEndReachedThreshold={0.5}
                    keyExtractor={(item, index) => index.toString()}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    onEndReached={onEndReached}
                    ListFooterComponent={footer(hasMore)}
                />
            </View>
        </SafeAreaView>
    );
}

const footer = (hasMore) => {
    if(hasMore) {
        return (
            <View style={styles.footerStyle}>
                <ProgressCircle size={30} indeterminate={true}/>
            </View>
        );
    } else {
        return (<View style={{flex: 1, height: 0, width: '100%',}}/>)
    }
};

const ImageSource = (item) => {
    const [uri, setUri] = useState(null);
    const [type, setType] = useState(item.item.type);
    const [selected, setSelected] = useState(item.item.selected);
    const [error, setError] = useState(false);
    const media = item.item as SaufotoMedia

    const fetchThumb = async (source) => {
        await item.getThumbUri(source).then( (src) => {
            setUri(src)
        })
    }

    useEffect(() => {
        fetchThumb(media.originalUri).catch((err) => {
            Log.error("Loading Thumb error:" + err)
        });
    }, []);

    const onItemSelected = () => {
        if(!error) {
            media.selected = !media.selected
            setSelected(media.selected)
            //navigation.navigate('ImageCarousel', {selected: item.id, collection: dataSource})
        }
    };

    const selectShow = () => {
        if( selected ) {
            return getPlaceFolder('asset_select_icon.png')
        }
        return null
    }
    if (type === 'image') {
        //Log.debug("Render image  '" + uri + "'")
        if( uri !== null) {
            return (
                <TouchableOpacity
                    key={media.id}
                    style={{flex: 1}}
                    onPress={() => {
                        onItemSelected();
                    }}>
                    <FastImage
                        style={styles.imageStyle}
                        source={{
                            uri:uri,
                            priority: FastImage.priority.low,
                        }}
                        onError={ () => {
                            Log.error("Loading Thumb error:" + uri)
                            setError(true)
                            setUri(null)
                        }}>
                        <Image style={styles.selectStyle} source={selectShow()}/>
                    </FastImage>
                </TouchableOpacity>
            )
        } else {
            //Log.debug("Render Image  '" + media.originalUri + "'")
            const image = error ?  media.errorImage:media.placeHolderImage
            return (
                <ImageBackground
                    style={styles.imageStyle}
                    source={getPlaceFolder(image)}>
                </ImageBackground>
            )
        }
    } else if (type === 'album'){
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

const itemSize = screenWidth/3 - 2
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
        flex: 1,
        height: itemSize,
        width: itemSize,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    tempStyle: {
        height: itemSize,
        width: itemSize,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.text
    },
    selectStyle: {
        height: 30,
        width: 30,
        marginRight:2,
        marginTop:2,
        zIndex: 5
    },
    footerStyle: {
        flex: 1,
        height: 40,
        width: '100%',
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
