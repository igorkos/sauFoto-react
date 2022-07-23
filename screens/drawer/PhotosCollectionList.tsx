import {Log} from "../../hooks/log";
import {
    BackHandler,
    FlatList,
    Platform,
    SafeAreaView,
    StyleSheet,
    Switch,
    TouchableOpacity
} from "react-native";
import {ProgressCircle, Text, View} from "../../components/Themed";
import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {theme} from "../../constants/themes";
import {DataSourceProvider, LoadImagesResponse} from "../../data/DataSourceProvider";
import {SaufotoImage, SaufotoObjectType,} from "../../data/watermelon/SaufotoImage";
import {ServiceType} from "../../data/ServiceType";
import {FlatListItemSizes, screenWidth} from "../../constants/Layout";
import {authorizeWith} from "../../data/AuthorizationProvicer";
import { SpeedyList, SpeedyListItemMeta, SpeedyListItemRenderer } from "react-native-speedy-list"
import {database} from "../../index";
import {ImportObject} from "../../data/watermelon/ImportObject";
import CollectionListItem from "../CollectionListItem";
import {Subscription} from "rxjs";
import {Q} from "@nozbe/watermelondb";
import {useIsFocused} from "@react-navigation/native";
import {ImportProvider} from "../../data/ImportProvider";
import Carousel from "react-native-snap-carousel";
import CollectionPreviewItem from "../CollectionPreviewItem";


const PubSub = require('pubsub-js');

export const photosListView = (navigation: { push: (arg0: string, arg1: { albumId: string|null; first?: number; }) => void; goBack: () => void; }, route: { params: { albumId: string; first: number; } | undefined; }, type: ServiceType, albums: boolean, isImport: boolean, isPreview: boolean = false) => {
    const [isLoading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [albumsPreview, setAlbumsPreview] = useState(true);
    const [events, setEvent] = useState('');
    const [error, setError] = useState<any | null>(null);
    const [visible, setVisible] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [root] = useState<string | null>(route.params !== undefined ? (route.params.albumId === undefined ? null : route.params.albumId) : null);
    const [objects, setObjects] = useState<ImportObject[] | SaufotoImage[]>([])
    const [_, setSubscription] = useState<Subscription | null>(null)
    const [indexSelected, setIndexSelected] = useState(0);
    const carouselRef = useRef<any>();
    const flatListRef = useRef<any>();

    const isFocused = useIsFocused();

    const menuSubscriber = (msg: any, data: React.SetStateAction<string>) => {
        setEvent(data)
    };

    const checkVisible = (isVisible: boolean | ((prevState: boolean) => boolean)) => {
        if(visible !== isVisible) {
            Log.debug(type + " " + (albums ? 'albums':'images') + " is in focus: " + isVisible + ' root: ' + root)
            if (isVisible) {
                setToken(PubSub.subscribe(type + 'Menu', menuSubscriber));
            } else {
                PubSub.unsubscribe(token);
                setToken(null)
            }
            setVisible(isVisible);
        }
    }

    checkVisible(isFocused)



    if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', function () {
            return false;
        });
    }

    const updateDataSource = (images?: LoadImagesResponse) => {
        if( images !== undefined ) {
            Log.debug(type + " complete load images hasMore: " + images.hasMore);
            setLoading(false)
            setHasMore(images.hasMore)
        }
    }

    const fetchData = async () => {
         if(type != ServiceType.Saufoto && type != ServiceType.Google) {
              setLoading(true)
              if (albums) {
                  return await DataSourceProvider.loadAlbums(type, root, null)
              } else {
                  return await DataSourceProvider.loadImages( type, root, null)
              }
         }else{
             setHasMore(false)
         }
    }

    const importAdd = async (entries: ImportObject[]) => {
        await ImportProvider.addEntries(entries)
    }

    const selectAll = async (entries: ImportObject[]) => {
        for( let entry of entries ) {
            await entry.setSelected(true)
        }
    }

    useEffect(() => {

        switch (events) {
            case 'selectAll':{
                Log.debug("PhotosListView -> select all")
                selectAll(objects as ImportObject[]).then(() => {
                    Log.debug("All selected")
                } )
                break
            }
            case 'importToGallery' : {
                const toImport = (objects as ImportObject[]).filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToGallery selected" + toImport)
                importAdd(toImport).then(() => {
                    Log.debug("Added to import queue")
                })
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


    const initData = useCallback(async () => {
        const parent = root === null ? '':root
        switch (type) {
            case ServiceType.Google:{
                const objects = await database.get<ImportObject>('ImportObject').query(
                    Q.where('origin',ServiceType.Google),
                    Q.where('type', (albums ? SaufotoObjectType.Album:SaufotoObjectType.Image)),
                    Q.where('parentId', parent),
                ).observe().subscribe({ next:(value) => {
                        Log.debug("Table update " + type + "images count: " + value.length)
                        setObjects(value)
                }})
                setSubscription(objects)
                break;
            }
            case ServiceType.Dropbox: {
                const objects = await database.get<ImportObject>('ImportObject').query(
                    Q.where('origin',ServiceType.Dropbox),
                    Q.where('parentId', parent),
                ).observe().subscribe({ next:(value) => {
                        Log.debug("Table update " + type + "images count: " + value.length)
                        setObjects(value)
                    }})
                setSubscription(objects)
                break;
            }
            case ServiceType.Camera: {
                const objects = await database.get<ImportObject>('ImportObject').query(
                    Q.where('origin',ServiceType.Camera),
                    Q.where('type', SaufotoObjectType.Image)
                ).observe().subscribe({ next:(value) => {
                        Log.debug("Table update " + type + "images count: " + value.length)
                        setObjects(value)
                    }})
                setSubscription(objects)
                break;
            }
            case ServiceType.Saufoto: {
                const objects = await database.get<ImportObject>('SaufotoImage').query().observe().subscribe({ next:(value) => {
                        Log.debug("Table update " + type + "images count: " + value.length)
                        setObjects(value)
                    }})
                setSubscription(objects)
                break;
            }
            default: {
                //objects = null
            }
        }
    }, [])

    useEffect(() => {
        initData().catch()
        Log.debug(type + " global event isLoading: " + isLoading)
        fetchData().then((response) => {
            // Log.debug("Load " + type + "images :" + JSON.stringify(images))
            updateDataSource(response)
        }).catch((err) => {
            Log.error("Loading " + type + " images error: " + err)
        })
    }, []);

    const onItemSelected = (item: ImportObject|SaufotoImage, index: number) => {
        if(item instanceof SaufotoImage ) {
            const albumId = route.params?.albumId != null ? route.params?.albumId:null
            navigation.push('PreviewImages', {albumId: albumId, first:index})
        } else {
            if(!isImport) {
                navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item), first:index})
            } else if(albums) {
                navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item)})
            }
        }
    };

    const toggleSwitch = useCallback( (state: boolean) => {
        Log.debug(type + " albums view mode: " + albumsPreview + " -> " + state)
        if(state != albumsPreview) {
            setAlbumsPreview(state)
        }
    },[albumsPreview]);



    useEffect(() => {
        const auth = async (service: ServiceType) => {
            await authorizeWith(service)
        }

        if (error !== null && error.reason === 'Not Authorized') {
            auth(error.provider).then(() => {
                setError(null)
            }).catch((err) => {
                Log.error("Authorize " + type + " error: " + err)
            })
        }
    }, [error]);

    const onError = (err: any) => {
        if( error ===  null ) {
            setError(err)
        }
    }

    const onCarouselSnap = (index:number) => {
        setIndexSelected(index);
        const THUMB_SIZE = FlatListItemSizes[type].small.width
        if (indexSelected * (THUMB_SIZE + 10) - THUMB_SIZE / 2 > screenWidth / 2) {
           flatListRef?.current?.scrollToOffset({
             offset: indexSelected * (THUMB_SIZE + 10) - screenWidth / 2 + THUMB_SIZE / 2,
             animated: true,
           });
         } else {
           flatListRef?.current?.scrollToOffset({
             offset: 0,
             animated: true,
           });
        }
    }
    // @ts-ignore
    const renderItem = useCallback<SpeedyListItemRenderer<ImportObjec|SaufotoImaget>>((props ) => {
        return <CollectionListItem  item={props.item} mode={albumsPreview} onSelected={onItemSelected} dataProvider={type} index={props.index} onError={onError} debug={true} small={false}/>
    },[albumsPreview])

    const renderFlatItem = useCallback((props: { item: ImportObject | SaufotoImage; index: any; })  => {
        const isSelected = props.index === indexSelected
        //Log.debug("selected " + props.index + " selected " + indexSelected + " " + isSelected)
        return <CollectionListItem  item={props.item} mode={albumsPreview} onSelected={(item: ImportObject|SaufotoImage, index: number) => {carouselRef?.current?.snapToItem(index)}} dataProvider={type} index={props.index} onError={onError} debug={true} small={true} isSelected={ isSelected }/>
    },[indexSelected])

    const renderCarousel = useCallback((props: { item: SaufotoImage; index: any; })  => {
        return <CollectionPreviewItem  item={props.item}  dataProvider={type} index={props.index} onError={onError} debug={true} uri={null}/>
    },[indexSelected])


    const height = albums ? FlatListItemSizes[type].album.layout : FlatListItemSizes[type].image.layout

    const compareItems = (a: ImportObject, b: ImportObject):boolean => {
        return a.id === b.id;
    }

    const keyItem = (meta: SpeedyListItemMeta<ImportObject>):string => {
        return meta.item.id
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

    // @ts-ignore
    return !isPreview ? (
        <SafeAreaView style={styles.container}>
                <SpeedyList<ImportObject>
                    scrollViewProps={{style:styles.container}}
                    // @ts-ignore
                    items={objects}
                    itemRenderer={renderItem}
                    itemKey={keyItem}
                    itemEquals={compareItems}
                    itemHeight={height}
                    columns={(albums ? 2 : 3)}
                    recyclableItemsCount={60}
                    recyclingDelay={20}
                    footer={footer(hasMore)}
                />
                <AlbumsPreview albums={albums} callback={toggleSwitch} state={albumsPreview} isImport={isImport}/>
        </SafeAreaView>) : (<SafeAreaView style={styles.container}>
                <Carousel
                    slideStyle={{ width: screenWidth }}
                    ref={carouselRef}
                    layout='default'
                    // @ts-ignore
                    data={objects as SaufotoImage[]}
                    firstItem={(route.params === undefined) ? 0:route.params.first }
                    initialScrollIndex={(route.params === undefined) ? 0:route.params.first }
                    lockScrollWhileSnapping={true}
                    getItemLayout={(data, index) => (
                        {length: screenWidth, offset: screenWidth * index, index}
                    )}
                    onSnapToItem={(index) => onCarouselSnap(index)}
                    sliderWidth={screenWidth}
                    itemWidth={screenWidth}
                    renderItem={renderCarousel}
                />
            <FlatList
                ref={flatListRef}
                horizontal={true}
                data={objects as SaufotoImage[]}
                style={{ position: 'absolute', bottom: 0 }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 1
                }}
                keyExtractor={(item) => item.id}
                // @ts-ignore
                renderItem={renderFlatItem}
            />
        </SafeAreaView>
    )
}

/*
<StatusBar hidden={true} />

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
                <Text style={{...styles.caption, fontWeight:sFont}} >Select</Text>
            </TouchableOpacity>
        </View>
    ):(<View style={{height:0}}/>)
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
