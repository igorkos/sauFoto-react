import {Log} from "../../hooks/log";
import {
    BackHandler,
    FlatList,
    Image,
    Platform,
    SafeAreaView, StatusBar,
    StyleSheet, Switch,
    TouchableOpacity
} from "react-native";
import {getPlaceFolder, ThumbSize} from "../../constants/Images";
import { View, ProgressCircle, Text} from "../../components/Themed";
import * as React from "react";
import {theme} from "../../constants/themes";
import {useEffect, useState} from "react";
import {DataSourceProvider, LoadImagesResponse} from "../../data/DataSourceProvider";
import FastImage from 'react-native-fast-image';
import {SaufotoAlbum, SaufotoImage, SaufotoMedia} from "../../data/SaufotoImage";
import {MediaContext} from "../../navigation/DrawerNavigator";
// @ts-ignore
import InViewPort from "@coffeebeanslabs/react-native-inviewport"
import {ServiceType} from "../../data/ServiceType";
import {FlatListItemSizes, screenHeight, screenWidth} from "../../constants/Layout";
import Carousel from "react-native-snap-carousel";
import PhotoView from 'react-native-photo-view';
import Colors from "../../constants/Colors";
import {HeaderBackButton} from "@react-navigation/elements";

const PubSub = require('pubsub-js');

export const photosListView = (navigation: { push: (arg0: string, arg1: { albumId: string|undefined; first?: any; }) => void; goBack: () => void; }, route: { params: { albumId: string; first: number; } | undefined; }, type: ServiceType, albums: boolean, isImport: boolean, isPreview: boolean = false) => {
    // @ts-ignore
    const {importGallery} = React.useContext(MediaContext);
    // @ts-ignore
    const {importTo} = React.useContext(MediaContext);

    const [dataSource, setDataSource] = useState<Array<SaufotoMedia>>([]);
    const [currentPage, setCurrentPage] = useState<string | null>( null);
    const [nextPage, setNextPage] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [albumsPreview, setAlbumsPreview] = useState(true);
    const [events, setEvent] = useState('');
    const [visible, setVisible] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [root] = useState<string | null>(route.params !== undefined ? (route.params.albumId === undefined ? null : route.params.albumId) : null);
    const [first] = useState<number>(route.params !== undefined ? (route.params.first === undefined ? 0 : route.params.first) : 0);

    const menuSubscriber = (msg: any, data: React.SetStateAction<string>) => {
        setEvent(data)
    };

    if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', function () {
            setNextPage(0)
            return false;
        });
    }

    const updateDataSource = (images?: LoadImagesResponse) => {
        if( images !== undefined ) {
            Log.debug(type + " get images page: " + nextPage);
            if (currentPage == null) {
                setDataSource(images.items)
            } else {
                const items = dataSource.concat(images.items)
                setDataSource(items)
            }
            setCurrentPage(images.nextPage)
            setLoading(false)
            setHasMore(images.hasMore)
            if (nextPage > 0) {
                setNextPage(nextPage - 1)
            }
        }
    }

    const imageUri = async (source: string) => {
        return await DataSourceProvider.getThumbsData(type, source, ThumbSize.THUMB_256)
    }

    const fetchData = async () => {
        if(visible) {
            setLoading(true)
            if (albums) {
                return await DataSourceProvider.loadAlbums(type, root, currentPage)
            } else {
                return await DataSourceProvider.loadImages(type, root, currentPage)
            }
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
            fetchData().then((response) => {
                updateDataSource(response)
            }).catch((err) => {
                Log.error("Loading " + type + "images error: " + err)
            });
        }
    }, [nextPage]);

    useEffect(() => {
        Log.debug(type + " isLoading event page: " + nextPage + " isLoading: " + isLoading)
        if(!isLoading && nextPage > 0 ) {
            fetchData().then((response) => {
                updateDataSource(response)
            }).catch((err) => {
                Log.error("Loading " + type + "images error: " + err)
            });
        }
    }, [isLoading]);

    useEffect(() => {
        Log.debug(type + " global event page: " + nextPage + " isLoading: " + isLoading)
        fetchData().then((response) => {
           // Log.debug("Load " + type + "images :" + JSON.stringify(images))
            updateDataSource(response)
        }).catch((err) => {
            Log.error("Loading " + type + "images error: " + err)
        });
    }, []);

    const onItemSelected = (item: SaufotoAlbum | SaufotoImage, index: number) => {
        if(!isImport) {
            navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item), first:index})
        } else if(albums) {
            navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item)})
        } else {
            item.selected = !item.selected
        }
    };

    const toggleSwitch = (state: boolean | ((prevState: boolean) => boolean)) => {
        if(state != albumsPreview) {
            setAlbumsPreview(state)
        }
    };

    const onMomentumScrollBegin = (syntheticEvent: { nativeEvent: any; }) => {
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
    const onEndReached = (event: any) => {
        Log.debug("onEndReached event: " + event )
        setNextPage(nextPage + 1 )
    }

    const checkVisible = (isVisible: boolean | ((prevState: boolean) => boolean)) => {
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

    const height = albums ? FlatListItemSizes[type].album.layout : FlatListItemSizes[type].image.layout
    return !isPreview ? (
        <InViewPort onChange={(isVisible: boolean | ((prevState: boolean) => boolean)) => checkVisible(isVisible)} style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={dataSource}
                    extraData={hasMore}
                    getItemLayout={(data, index) => (
                        {length: height, offset: height * index, index}
                    )}
                    renderItem={({item, index}) => (
                        <ImageSource item={item} getThumbUri={imageUri} mode={albumsPreview} onSelected={onItemSelected} dataProvider={type} isImport={isImport} index={index}/>
                    )}
                    numColumns={(albums ? 2 : 3)}
                    initialNumToRender={21}
                    onEndReachedThreshold={0.5}
                    keyExtractor={(item, index) => index.toString()}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    onEndReached={onEndReached}
                    ListFooterComponent={footer(hasMore)}
                />
                <AlbumsPreview albums={albums} callback={toggleSwitch} state={albumsPreview} isImport={isImport}/>
            </SafeAreaView>
        </InViewPort>
    ):(
        <View style={{ flex: 1, backgroundColor:Colors.light.black, alignItems: 'center'}} >
            <StatusBar hidden={true} />
            <InViewPort onChange={(isVisible: boolean | ((prevState: boolean) => boolean)) => checkVisible(isVisible)} style={{ flex: 1, backgroundColor:Colors.light.black, alignItems: 'flex-start'}}>
                <Carousel
                    slideStyle={{ width: screenWidth }}
                    layout='default'
                    data={dataSource}
                    firstItem={first}
                    initialScrollIndex={first}
                    lockScrollWhileSnapping={true}
                    getItemLayout={(data, index) => (
                        {length: screenWidth, offset: screenWidth * index, index}
                    )}
                    sliderWidth={screenWidth}
                    itemWidth={screenWidth}
                    itemHeight={screenHeight}
                    renderItem={({ item, index }) => (
                        <PhotoView
                            source={{uri:item.originalUri}}
                            minimumZoomScale={1}
                            maximumZoomScale={10}
                            androidScaleType="fitCenter"
                            onLoad={() => Log.debug("Image loaded!" + index)}
                            style={{flex: 1}} />
                    )}
                />
                <HeaderBackButton style={{ zIndex: 5, width: 20, height:20}}
                                  label={'Back'}
                                  onPress={() => {
                                      Log.debug('Header left press')
                                      navigation.goBack()
                                  }}
                />
            </InViewPort>
        </View>
    )
}

const AlbumsPreview = (props: { state: boolean | undefined; albums: any; isImport: any; callback: (arg0: boolean) => void; }) => {
    const bFont =  props.state ? 'normal':'bold'
    const sFont =  props.state ? 'bold':'normal'
    return (props.albums && props.isImport) ? (
        <View style={styles.previewStyle}>
            <TouchableOpacity style={{...styles.caption, height:'100%', marginEnd:10,}} onPress={() =>{props.callback(false)}}>
                <Text style={{...styles.caption, fontWeight:bFont}} >Browse</Text>
            </TouchableOpacity>
            <Switch
                style={styles.switchStyle}
                trackColor={{ false: theme.colors.tint, true: theme.colors.tint }}
                thumbColor={theme.colors.text}
                ios_backgroundColor={theme.colors.background}
                value={props.state}
            />
            <TouchableOpacity style={{...styles.caption, height:'100%',  marginStart:10, marginEnd:10,}} onPress={() =>{props.callback(true)}}>
                <Text style={{...styles.caption, fontWeight:sFont}} onPress={() =>{props.callback(true)}}>Select</Text>
            </TouchableOpacity>
        </View>
    ):(<View style={{flex:1,height:0}}/>)
}

const footer = (hasMore: boolean) => {
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

const ImageSource = (props: { item: SaufotoAlbum | SaufotoImage | SaufotoMedia; isImport: any; getThumbUri: (arg0: any) => Promise<any>; mode: any; onSelected: (arg0: SaufotoAlbum | SaufotoImage, arg1: number) => void; index: any; dataProvider: ServiceType; }) => {
    const [uri, setUri] = useState(null);
    const [type] = useState(props.item.type);
    const [isImport] = useState(props.isImport);
    const [selected, setSelected] = useState(props.item.selected);
    const [error, setError] = useState(false);
    const media = type === 'album' ? (props.item as SaufotoAlbum):(props.item as SaufotoImage)

    const fetchThumb = async (source: string | undefined) => {
        await props.getThumbUri(source).then( (src) => {
            setUri(src)
        })
    }

    useEffect(() => {
        if( media.originalUri !== null) {
            fetchThumb(media.originalUri).catch((err) => {
                Log.error("Loading Thumb error:" + err)
            });
        }
    }, []);

    const onItemSelected = () => {
        if(!error) {
            if (!props.mode || !isImport) {
                props.onSelected(media, props.index)
            } else {
                media.selected = !media.selected
                setSelected(media.selected)
            }
        }
    };

    const selectShow = () => {
        if( selected ) {
            return getPlaceFolder('asset_select_icon.png')
        }
        return null
    }

    const CaptionView = (captionProps: { title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; count: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
        return type === 'album' ? (
            <View style={{height:40, marginTop:5, marginBottom:2}}>
                <Text style={styles.caption}>{captionProps.title}</Text>
                <Text style={styles.caption}>{captionProps.count}</Text>
            </View>
        ):(<View style={{flex:1,height:0}}/>)
    }

    const imageStyle = type === 'album' ? {...styles.albumStyle,  height: FlatListItemSizes[props.dataProvider].album.height, width: FlatListItemSizes[props.dataProvider].album.width,}:
        {...styles.imageStyle,  height: FlatListItemSizes[props.dataProvider].image.height, width: FlatListItemSizes[props.dataProvider].image.width,}
    //Log.debug("Render image  '" + uri + "'")
    const image = error ?  media.errorImage:media.placeHolderImage
    const source = uri === null ? getPlaceFolder(image):{uri:uri, priority: FastImage.priority.low,}
    return (
        <TouchableOpacity
            key={media.id}
            style={{flex: 1}}
            onPress={() => {
                onItemSelected();
            }}>
            <FastImage
                style={(imageStyle)}
                source={source}
                onError={ () => {
                    Log.error("Loading Thumb error:" + uri)
                    setError(true)
                    setUri(null)
                }}>
                <Image style={styles.selectStyle} source={selectShow()}/>
            </FastImage>
            <CaptionView title={media.title} count={"count" in media ? media.count :null}/>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    caption: {
        flexDirection:'row',
        fontSize: 14,
        lineHeight: 14,
        numberOfLines:1,
        ellipsizeMode:'tail',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
    },
    imageStyle: {
        borderWidth: 1,
        borderRadius: 3,
        borderColor:theme.colors.tint,
        elevation:2,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    albumStyle: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor:theme.colors.tint,
        elevation:1,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
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
        height:'100%',
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
