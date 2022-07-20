import {Log} from "../../hooks/log";
import {BackHandler, FlatList, Platform, SafeAreaView, StyleSheet, Switch, TouchableOpacity} from "react-native";
import {getPlaceFolder, Placeholders, ThumbSize, thumbSize} from "../../constants/Images";
import {ProgressCircle, Text, View} from "../../components/Themed";
import * as React from "react";
import {Component, PureComponent, useCallback, useEffect, useState} from "react";
import {theme} from "../../constants/themes";
import {DataSourceProvider, LoadImagesResponse} from "../../data/DataSourceProvider";
import FastImage from 'react-native-fast-image';
import SaufotoContext, {
    SaufotoAlbum,
    SaufotoImage,
    SaufotoObjectType,
    SaufotoSyncAction,
    ServiceImportCamera,
    ServiceImportEntry,
    ServiceImportGoogle
} from "../../data/SaufotoImage";
// @ts-ignore
import InViewPort from "@coffeebeanslabs/react-native-inviewport"
import {ServiceType} from "../../data/ServiceType";
import {FlatListItemSizes} from "../../constants/Layout";
import {authorizeWith} from "../../data/AuthorizationProvicer";
import { SpeedyList, SpeedyListItemMeta, SpeedyListItemRenderer } from "react-native-speedy-list"

const {useRealm, useQuery} = SaufotoContext;
const PubSub = require('pubsub-js');

export const photosListView = (navigation: { push: (arg0: string, arg1: { albumId: string|null; first?: any; }) => void; goBack: () => void; }, route: { params: { albumId: string; first: number; } | undefined; }, type: ServiceType, albums: boolean, isImport: boolean, isPreview: boolean = false) => {
    const [currentPage, setCurrentPage] = useState<string | null>( null);
    const [nextPage, setNextPage] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [albumsPreview, setAlbumsPreview] = useState(true);
    const [events, setEvent] = useState('');
    const [error, setError] = useState<any | null>(null);
    const [visible, setVisible] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [root] = useState<string | null>(route.params !== undefined ? (route.params.albumId === undefined ? null : route.params.albumId) : null);
    const [objects, setObjects] = useState()
    const [render, setForceRender] = useState(false)
    const realm = useRealm()



        //useQuery('ServiceImportGoogle')
 //   const sortedCollection = useMemo(() => {
 //       return objects.filtered("parentId = '" + parent + "' AND type = '" + (albums ? SaufotoObjectType.Album:SaufotoObjectType.Image) + "'")
 //   }, [objects]);
    //setObjects(sortedCollection)

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
            setCurrentPage(images.nextPage)
            setLoading(false)
            setHasMore(images.hasMore)
            if (nextPage > 0) {
                setNextPage(nextPage - 1)
            }
        }
    }

    const fetchData = async () => {
       /* if(visible && type != ServiceType.Saufoto) {
             setLoading(true)
             if (albums) {
                 return await DataSourceProvider.loadAlbums(realm, type, root, currentPage)
             } else {
                 return await DataSourceProvider.loadImages(realm, type, root, currentPage)
             }
        }*/
    }

    useEffect(() => {
        switch (events) {
            case 'importToGallery' : {
              /*  const toImport = dataSource.filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToGallery selected" + toImport)
                realm.write(() => {
                    toImport.forEach((item) =>{
                        const type = item.type === 'image' ? 'SaufotoImage':'SaufotoAlbum'
                        item.selected = false
                        item.update = 'pending'
                        realm.create(type,item)
                    })
                })*/
                break;
            }
            case 'importToAlbum': {
                /*
                const toImport = dataSource.filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToAlbum selected" + JSON.stringify(toImport))
                 */
                break;
            }
        }
        setEvent('')
    },[events])

    useEffect(() => {
        Log.debug(type + " nextPage event nextPage= " + nextPage + " hasMore =" + hasMore + " isLoading = " + isLoading )
        if(hasMore && !isLoading && nextPage > 0) {
            fetchData().then((response) => {
                updateDataSource(response)
            }).catch((err) => {
                Log.error("Loading " + type + "images error: " + err)
            });
        }
    }, [nextPage,isLoading]);

    const initData = useCallback(() => {
        switch (type) {
            case ServiceType.Google:{
                const parent = root === null ? '':root
                const objects = realm.objects('ServiceImportGoogle') //.filtered("parentId = '" + parent + "' AND type = '" + (albums ? SaufotoObjectType.Album:SaufotoObjectType.Image) + "'")
                setObjects(objects)
                break;
            }
            case ServiceType.Dropbox: {
                const parent = root === null ? '':root
                const objects = realm.objects('ServiceImportDropbox').filtered("parentId = '" + parent + "'")
                setObjects(objects)
                break;
            }
            case ServiceType.Camera: {
                const objects = realm.objects('ServiceImportCamera')
                setObjects(objects)
                break;
            }
            case ServiceType.Saufoto: {
                //objects = albums? useQuery(SaufotoAlbum):useQuery(SaufotoImage);
                break;
            }
            default: {
                //objects = null
            }
        }
    }, [realm])

    useEffect(() => {
        initData()
        Log.debug(type + " global event page: " + nextPage + " isLoading: " + isLoading)
        fetchData().then((response) => {
            // Log.debug("Load " + type + "images :" + JSON.stringify(images))
            updateDataSource(response)
        }).catch((err) => {
            Log.error("Loading " + type + "images error: " + err)
        })
    }, []);

    const onItemSelected = (item: SaufotoAlbum | SaufotoImage, index: number) => {
        if(!isImport) {
            navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(realm, type, item), first:index})
        } else if(albums) {
            navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(realm, type, item)})
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
            if( pagesToLoad < 8 && (pagesToLoad - nextPage) > 0) {
                Log.debug("onMomentumScrollBegin event pages to load: " + (pagesToLoad - nextPage))
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

    const onError = (err: any) => {
        if( error ===  null ) {
            const auth = async () => {
                await authorizeWith(type)
            }
            if (err === 'Not Authorized') {
                setError(err)
                auth().then((response) => {
                    // Log.debug("Load " + type + "images :" + JSON.stringify(images))
                    setError(null)
                    setForceRender(!render)
                }).catch((err) => {
                    Log.error("authorize " + type + "error: " + err)
                })
            }
        }
    }
    // @ts-ignore
    const renderItem = ({item, index}) => {
        return (// @ts-ignore
            <ImageSource  realm={realm} item={item} mode={albumsPreview} onSelected={onItemSelected} dataProvider={type} index={index} onError={onError}/>
        )}

    const height = albums ? FlatListItemSizes[type].album.layout : FlatListItemSizes[type].image.layout

    const itemKey = useCallback(
        ({ item, index }: SpeedyListItemMeta<ServiceImportGoogle>) => {
            return item.originId;
        },
        []
    )

    return (
            <SafeAreaView style={styles.container}>
                <SpeedyList<ServiceImportGoogle>
                    items={objects}
                    itemRenderer={renderItem}
                    itemHeight={height}
                    itemKey={itemKey}>
                    <AlbumsPreview albums={albums} callback={toggleSwitch} state={albumsPreview} isImport={isImport}/>
                </SpeedyList>
            </SafeAreaView>
    )
}

/*
<FlatList
                    // @ts-ignore
                    data={objects}
                    extraData={render}
                    getItemLayout={(data, index) => (
                        {length: height, offset: height * index, index}
                    )}
                    renderItem={renderItem}
                    numColumns={(albums ? 2 : 3)}
                    initialNumToRender={21}
                    onEndReachedThreshold={0.5}
                    keyExtractor={(item, index) => item._id.toString()}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    onEndReached={onEndReached}
                    ListFooterComponent={footer(hasMore)}
                    windowSize={60}
                    removeClippedSubviews={false}
                />
 <InViewPort onChange={(isVisible: boolean | ((prevState: boolean) => boolean)) => checkVisible(isVisible)} style={styles.container}>
 </InViewPort>
 */
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

interface ImageSourceState {
    source: {uri: string;} | any,
    type: SaufotoObjectType,
    selected: boolean,
    error: boolean,
}

interface ImageSourceProps {
     realm: Realm;
     item: ServiceImportEntry;
     mode: any;
     onSelected: (entry: ServiceImportEntry, index: number) => void;
     onError: (error: any) => void;
     index: any;
     dataProvider: ServiceType;
}


class ImageSource extends PureComponent<ImageSourceProps, ImageSourceState> {

    size: ThumbSize = ThumbSize.THUMB_128;
    imageStyle: any

    constructor(props: ImageSourceProps) {
        super(props);
        const itemType: SaufotoObjectType = this.props.item.type as SaufotoObjectType
        Log.error("Constructor!!")
        this.size = thumbSize(itemType === SaufotoObjectType.Image ? FlatListItemSizes[this.props.dataProvider].image.width: FlatListItemSizes[this.props.dataProvider].album.width)
        this.imageStyle = itemType === 'album' ? {...styles.albumStyle,  height: FlatListItemSizes[this.props.dataProvider].album.height, width: FlatListItemSizes[this.props.dataProvider].album.width,}:
            {...styles.imageStyle,  height: FlatListItemSizes[this.props.dataProvider].image.height, width: FlatListItemSizes[this.props.dataProvider].image.width,}

        this.state = {
            source: {uri:null},
            type: itemType,
            selected: this.props.item.selected,
            error: false,
        }
    }

    /*shouldComponentUpdate(nextProps: ImageSourceProps, nextState : ImageSourceState): boolean {
        if(this.state.error !== nextState.error) {
            return true
        }
        return false
    }*/

    componentDidMount() {
        if( this.state.source.uri === null) {
            const fetchThumb = async () => {
                await DataSourceProvider.getThumbsData(this.props.realm, this.props.dataProvider, this.props.item, this.size).then((src) => {
                    this.setState({source: {uri: src}});
                })
            }

           /* if (this.props.item.originalUri !== null) {
                fetchThumb().catch((err) => {
                    Log.error("Loading Thumb error:" + err)
                    this.setState({ error: true });
                    this.setState( { source: Placeholders.imageError});
                    this.props.onError(err)
                });
            }*/
        }
    }

    onItemSelected(){
        const media = this.props.item
        if(!this.state.error) {
            if (!this.props.mode) {
                this.props.onSelected(media, this.props.index)
            } else {
                media.selected = !media.selected
                this.setState({ selected: media.selected });
            }
        }
    };

    selectShow(){
        const media = this.props.item
        if(media.syncOp === SaufotoSyncAction.Pending) {
            return getPlaceFolder('sync_white.png')
        }
        if( this.state.selected ) {
            return getPlaceFolder('asset_select_icon.png')
        }
        return null
    }

    CaptionView(props: {title:string | null | undefined, count: number, type:SaufotoObjectType }) {
        return props.type === SaufotoObjectType.Album ? (
            <View style={{height:40, marginTop:5, marginBottom:2}}>
                <Text style={styles.caption}>{props.title}</Text>
                <Text style={styles.caption}>{props.count}</Text>
            </View>
        ):(<View style={{flex:1,height:0}}/>)
    }

    render() {
        const media = this.props.item
        Log.debug("Render image  '" + this.state.source + "'")
        return (
            <TouchableOpacity
                key={media.originId}
                style={{flex: 1}}
                onPress={() => {this.onItemSelected();}}>
                <FastImage
                    style={this.imageStyle}
                    source={this.state.source}
                    onError={ () => {
                        this.setState({ error: true });
                        this.setState( { source: Placeholders.imageError});
                    }}>
                </FastImage>
                <this.CaptionView title={media.title} count={"count" in media ? media.count :0} type={this.state.type}/>
            </TouchableOpacity>
        )
    }
}

/*
<CaptionView title={media.title} count={"count" in media ? media.count :null}/>
  <Image style={styles.selectStyle} source={selectShow()}/>
const ImageSource = (props: { realm: Realm;  item: ServiceImportEntry;  mode: any; onSelected: (arg0: ServiceImportEntry, arg1: number) => void; index: any; dataProvider: ServiceType; }) => {
    const [type] = useState(props.item.type);

    const size = thumbSize(type === SaufotoObjectType.Image ? FlatListItemSizes[props.dataProvider].image.width: FlatListItemSizes[props.dataProvider].album.width)
    const media = props.item
    const [uri, setUri] = useState(media.getThumbUri(size));
    const [selected, setSelected] = useState(props.item.selected);
    const [error, setError] = useState(false);
    const realm = props.realm

    const fetchThumb = async () => {
      /*  await DataSourceProvider.getThumbsData(realm,props.dataProvider,media,size).then( (src) => {
            setUri(src)
        })
    }

    useEffect(() => {
        if( media.originalUri !== null) {
            fetchThumb().catch((err) => {
                Log.error("Loading Thumb error:" + err)
            });
        }
    }, []);

    const onItemSelected = () => {
        if(!error) {
            if (!props.mode) {
                props.onSelected(media, props.index)
            } else {
                media.selected = !media.selected
                setSelected(media.selected)
            }
        }
    };

    const selectShow = () => {
        if(media.syncOp === SaufotoSyncAction.Pending) {
            return getPlaceFolder('sync_white.png')
        }
        if( selected ) {
            return getPlaceFolder('asset_select_icon.png')
        }
        return null
    }

    const CaptionView = (captionProps: { title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; count: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
        return type === SaufotoObjectType.Album ? (
            <View style={{height:40, marginTop:5, marginBottom:2}}>
                <Text style={styles.caption}>{captionProps.title}</Text>
                <Text style={styles.caption}>{captionProps.count}</Text>
            </View>
        ):(<View style={{flex:1,height:0}}/>)
    }

    const imageStyle = type === 'album' ? {...styles.albumStyle,  height: FlatListItemSizes[props.dataProvider].album.height, width: FlatListItemSizes[props.dataProvider].album.width,}:
        {...styles.imageStyle,  height: FlatListItemSizes[props.dataProvider].image.height, width: FlatListItemSizes[props.dataProvider].image.width,}
    //Log.debug("Render image  '" + uri + "'")

    const image = error ? (Placeholders.imageError) : Placeholders.image
    const source = uri === null ? image:{uri:uri, priority: FastImage.priority.low,}
    return (
        <TouchableOpacity
            key={media.originId}
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
*/
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
