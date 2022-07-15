import {Log} from "../../hooks/log";
import {
    BackHandler,
    FlatList,
    Image,
    ImageBackground,
    Platform,
    SafeAreaView,
    StyleSheet, Switch,
    TouchableOpacity
} from "react-native";
import {getPlaceFolder, ThumbSize} from "../../constants/Images";
import {screenWidth, View, ProgressCircle, Text} from "../../components/Themed";
import * as React from "react";
import {theme} from "../../constants/themes";
import {Item} from "linked-list";
import {useEffect, useState} from "react";
import {DataSourceProvider} from "../../data/DataSourceProvider";
import {ServiceType} from "../../data/DataServiceConfig";
import Colors from "../../constants/Colors";
import FastImage from 'react-native-fast-image';
import {SaufotoAlbum, SaufotoImage} from "../../data/SaufotoImage";
import {MediaContext} from "../../navigation/DrawerNavigator";
import InViewPort from "@coffeebeanslabs/react-native-inviewport"
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
const imageSize = screenWidth/3 - 2
const albumWidth = screenWidth/2 - 6
const albumHeight = (screenWidth/2 - 6) + 40


export const photosListView = (navigation, route, type:ServiceType, albums: boolean) => {
    const {importGallery} = React.useContext(MediaContext);
    const {importTo} = React.useContext(MediaContext);

    const [dataSource, setDataSource] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);
    const [nextPage, setNextPage] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [albumsPreview, setAlbumsPreview] = useState(true);
    const [events, setEvent] = useState('');
    const [visible, setVisible] = useState(true);
    const [token, setToken] = useState(null);


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
        if(albums) {
            return await DataSourceProvider.loadAlbums(type, root, currentPage)
        } else {
            const albumId = route.params !== undefined ? (route.params.albumId === undefined ? null:route.params.albumId):null
            return await DataSourceProvider.loadImages(type, albumId, currentPage)
        }
    }

    useEffect(() => {
        switch (events) {
            case 'importToGallery' : {
                const toImport = dataSource.filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToGallery selected" + JSON.stringify(toImport))
                importGallery(toImport)
                break;
            }
            case 'importToAlbum': {
                const toImport = dataSource.filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToAlbum selected" + JSON.stringify(toImport))
                importTo(toImport, null)
                break;
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
           // Log.debug("Load " + type + "images :" + JSON.stringify(images))
            updateDataSource(images)
        }).catch((err) => {
            Log.error("Loading " + type + "images error:" + err)
        });
    }, []);

    const onItemSelected = (item) => {
        if(albums) {
            navigation.push('GoogleAlbumImages', {albumId: item.id})
        } else {
            item.selected = !item.selected
        }
        //navigation.navigate('ImageCarousel', {selected: item.id, collection: dataSource})
    };

    const toggleSwitch = (state) => {
        if(state != albumsPreview) {
            setAlbumsPreview(state)
        }
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

    const checkVisible = (isVisible) => {
        if(visible !== isVisible) {
            setVisible(isVisible);
            Log.debug(type + " albums: " + albums + " is in focus: " + visible)
            if (visible) {
                setToken(PubSub.subscribe(type + 'Menu', menuSubscriber));
            } else {
                PubSub.unsubscribe(token);
                setToken(null)
                setNextPage(0)
            }
        }
    }

    const height = albums ? albumHeight : styles.imageStyle.height
    return (
        <InViewPort onChange={(isVisible) => checkVisible(isVisible)} style={styles.container}>
            <SafeAreaView style={styles.container}>

                <View style={styles.container}>
                    <FlatList
                        data={dataSource}
                        extraData={hasMore}
                        getItemLayout={(data, index) => (
                            {length: height, offset: height * index, index}
                        )}
                        renderItem={({item}) => (
                            <View style={styles.imageContainerStyle}>
                                <ImageSource item={item} getThumbUri={imageUri} mode={albumsPreview} onSelected={onItemSelected}/>
                            </View>
                        )}
                        numColumns={(albums ? 2 : 3)}
                        initialNumToRender={21}
                        onEndReachedThreshold={0.5}
                        keyExtractor={(item, index) => index.toString()}
                        onMomentumScrollBegin={onMomentumScrollBegin}
                        onEndReached={onEndReached}
                        ListFooterComponent={footer(hasMore)}
                    />
                    <AlbumsPreview albums={albums} callback={toggleSwitch} state={albumsPreview}/>
                </View>
            </SafeAreaView>
        </InViewPort>
    );
}

const AlbumsPreview = (props) => {
    const bFont =  props.state ? 'normal':'bold'
    const sFont =  props.state ? 'bold':'normal'
    return props.albums ? (
        <View style={styles.previewStyle}>
            <Text style={{flexDirection:'row', marginEnd:10, fontWeight:bFont}} onPress={() =>{props.callback(false)}}>Browse</Text>
            <Switch
                style={styles.switchStyle}
                trackColor={{ false: theme.colors.tint, true: theme.colors.tint }}
                thumbColor={theme.colors.text}
                ios_backgroundColor={theme.colors.background}
                value={props.state}
            />
            <Text style={{flexDirection:'row', marginStart:10, marginEnd:10, fontWeight:sFont}} onPress={() =>{props.callback(true)}}>Select</Text>
        </View>
    ):(<View style={{flex:1,height:0}}/>)
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

const ImageSource = (props) => {
    const [uri, setUri] = useState(null);
    const [type] = useState(props.item.type);
    const [selected, setSelected] = useState(props.item.selected);
    const [error, setError] = useState(false);
    const media = type === 'album' ? (props.item as SaufotoAlbum):(props.item as SaufotoImage)

    const fetchThumb = async (source) => {
        await props.getThumbUri(source).then( (src) => {
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
            if (!props.mode) {
                props.onSelected(media)
            } else {
                media.selected = !media.selected
                setSelected(media.selected)
            }
            //navigation.navigate('ImageCarousel', {selected: item.id, collection: dataSource})
        }
    };

    const selectShow = () => {
        if( selected ) {
            return getPlaceFolder('asset_select_icon.png')
        }
        return null
    }

    const CaptionView = (props) => {
        return type === 'album' ? (
            <View style={{height:40, marginTop:5, marginBottom:2}}>
                <Text style={styles.caption}>{props.title}</Text>
                <Text style={styles.caption}>{props.count}</Text>
            </View>
        ):(<View style={{flex:1,height:0}}/>)
    }
    const imageStyle = type === 'album' ? styles.albumStyle:styles.imageStyle
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
                    style={(imageStyle)}
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
                <CaptionView title={media.title} count={"count" in media ? media.count :0}/>
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    caption: {
        flex: 1,
        justifyContent: 'center',
        fontSize: 14,
        lineHeight: 14,
        height:16,
        numberOfLines:1,
        ellipsizeMode:'tail'
    },
    imageContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
    },
    imageStyle: {
        flex: 1,
        height: imageSize,
        width: imageSize,
        borderWidth: 1,
        borderRadius: 3,
        borderColor:theme.colors.tint,
        elevation:2,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    albumStyle: {
        flex: 1,
        height: albumWidth,
        width: albumWidth,
        borderWidth: 1,
        borderRadius: 5,
        borderColor:theme.colors.tint,
        elevation:5,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    tempStyle: {
        height: imageSize,
        width: imageSize,
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
    switchStyle: {
        flexDirection:'row',
    },
    previewStyle: {
        flexDirection:'row',
        height: 40,
        width: '100%',
        backgroundColor: theme.colors.background,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
});
