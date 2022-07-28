import {Log} from "../../utils/log";
import {BackHandler, FlatList, Platform, SafeAreaView, StyleSheet} from "react-native";
import {ProgressCircle, View} from "../../styles/Themed";
import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {theme} from "../../styles/themes";
import {DataSourceProvider, LoadImagesResponse} from "../../data/DataSourceProvider";
import {SaufotoImage, SaufotoObjectType,} from "../../data/watermelon/SaufotoImage";
import {ServiceType} from "../../data/ServiceType";
import {FlatListItemSizes, screenWidth} from "../../styles/Layout";
import {authorizeWith} from "../../data/AuthorizationProvicer";
import {SpeedyList, SpeedyListItemMeta, SpeedyListItemRenderer} from "react-native-speedy-list"
import {ImportObject, subscribeImports} from "../../data/watermelon/ImportObject";
import CollectionListItem, {CollectionItemRenderStates} from "./CollectionListItem";
import {Subscription} from "rxjs";
import {useIsFocused} from "@react-navigation/native";
import {ImportProvider} from "../../data/ImportProvider";
import Carousel from "react-native-snap-carousel";
import CollectionPreviewItem from "./CollectionPreviewItem";
import {NewAlbumDialog} from "./AlbumSelectDialog";
import {
    addImagesToAlbum,
    addSaufotoAlbum,
    deleteAlbum,
    deleteImages,
    subscribeAlbums, subscribeImages
} from "../../data/watermelon/DataSourceUtils";
import {ActionEvent, ActionEvents, createAction, eventsSubscriber} from "../types/ActionEvents";
import {database} from "../../index";
import Colors from "../../styles/Colors";
import {AlbumsPreviewBar} from "./AlbumsPreviewBar";
import {SelectionBar} from "./SelectionBar";
import {SaufotoAlbum} from "../../data/watermelon/SaufotoAlbum";


const PubSub = require('pubsub-js');
// @ts-ignore
export const photosListView = (navigation, route, type: ServiceType, albums: boolean, isImport: boolean, isPreview: boolean = false) => {
    const [root] = useState<string | null>(route.params !== undefined ? (route.params.albumId === undefined ? null : route.params.albumId) : null);
    const [title] = useState<string | null>(route.params !== undefined ? (route.params.title === undefined ? null : route.params.title) : null);
    const [actionBarVisible, setActionBarVisible] = useState<boolean>(false);
    if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', function () {
            return false;
        });
    }

    /*
    Dialog handling
     */
    const [isAddAlbum, setIsAddAlbum] = useState(false);
    const addAlbum = async (name: string | null) => {
        setIsAddAlbum(false)
        if( name !== null) {
            await addSaufotoAlbum(name)
        }
    }
    /*
    Screen Menu Action processing
    */
    const [events, setEvent] = useState<ActionEvent>(createAction(ActionEvents.none));

    const menuSubscriber = (msg: any, data: React.SetStateAction<ActionEvent>) => {
        setEvent(data)
    };

    const importAdd = async (entries: ImportObject[]) => {
        await ImportProvider.addEntries(entries)
    }

    const imagesDelete = async (entries: SaufotoImage[]) => {
        await deleteImages(entries, root)
    }

    const albumDelete = async (albumId: string) => {
        await deleteAlbum(albumId)
    }

    const addToAlbum = async (entries: SaufotoImage[]) => {
        await addImagesToAlbum(entries, root!)
    }

    const selectAll = async (entries: ImportObject[]) => {
        await database.write(async () => {
            for( let entry of entries ) {
                entry.update( record => record.selected = true )
            }
        })
    }

    const selectImages = (select: boolean) => {
        Log.debug("PhotosListView -> set actionBar:" + select)
        setActionBarVisible(select)
    }

    useEffect(() => {
        if(!isPreview && !isImport && root === null) {
            const style = actionBarVisible ? {display: 'none'} : {display: 'flex'}
            Log.debug("PhotosListView -> set actionBar:" + actionBarVisible)
            navigation.getParent("BottomTab").setOptions({
                tabBarStyle: style,
            })
        }
    },[actionBarVisible])

    useEffect(() => {
        switch (events.event) {
            case ActionEvents.selectAll:{
                Log.debug("PhotosListView -> select all")
                selectAll(objects as ImportObject[]).then(() => {
                    Log.debug("PhotosListView -> All selected")
                    setEvent(createAction(ActionEvents.none))
                } )
                break
            }
            case ActionEvents.importToGallery : {
                const toImport = (objects as ImportObject[]).filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToGallery selected" + toImport)
                importAdd(toImport).then(() => {
                    Log.debug("PhotosListView -> Added to import queue")
                    setEvent(createAction(ActionEvents.none))
                })
                break;
            }
            case ActionEvents.addAlbum : {
                setIsAddAlbum(true)
                setEvent(createAction(ActionEvents.none))
                break;
            }
            case ActionEvents.addToAlbum: {
                const toAdd = (objects as SaufotoImage[]).filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToGallery selected " + toAdd.length)
                addToAlbum(toAdd).then(() => {
                    Log.debug("PhotosListView -> Added to album")
                    navigation.goBack()
                })
                break
            }
            case ActionEvents.addImages : {
                navigation.push('SaufotoAlbumAddImages', {albumId: root, title:('Add to ' + title)})
                break;
            }
            case ActionEvents.importToAlbum: {
                /*
                const toImport = dataSource.filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> importToAlbum selected" + JSON.stringify(toImport))
                 */
                break;
            }
            case ActionEvents.selectImages:{
                selectImages(!events.data)
                break
            }
            case ActionEvents.delete:{
                const toDelete = (objects as SaufotoImage[]).filter((value) => {
                    return value.selected
                })
                Log.debug("PhotosListView -> delete selected " + toDelete)
                imagesDelete(toDelete).then(() => {
                    Log.debug("PhotosListView -> Deleted images")
                    setEvent(createAction(ActionEvents.none))
                })
                break
            }
            case ActionEvents.deleteAlbum:{
                Log.debug("PhotosListView -> delete album selected " + root)
                albumDelete(root!).then(() => {
                    Log.debug("PhotosListView -> Deleted images")
                    navigation.goBack()
                })
                break
            }
        }
    },[events])


    /*
    Screen focus control subscribe/unsubscribe from message queue
     */
    const [visible, setVisible] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const isFocused = useIsFocused();
    const checkVisible = (isVisible: boolean | ((prevState: boolean) => boolean)) => {
        if(visible !== isVisible) {
            Log.debug(type + " " + (albums ? 'albums':'images') + " is in focus: " + isVisible + ' root: ' + root)
            if (isVisible) {
                setToken(PubSub.subscribe(eventsSubscriber, menuSubscriber));
            } else {
                PubSub.unsubscribe(token);
                setToken(null)
            }
            setVisible(isVisible);
        }
    }

    checkVisible(isFocused)

    /*
    Data fetching
     */
    const [objects, setObjects] = useState<ImportObject[] | SaufotoImage[] | SaufotoAlbum[]>([])
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setLoading] = useState(false);
    const [_, setSubscription] = useState<Subscription | null>(null)
    const initData = useCallback(async () => {
         switch (type) {
            case ServiceType.Google:{
                const subscription = await subscribeImports(ServiceType.Google, root,  (albums ? SaufotoObjectType.Album:SaufotoObjectType.Image), (value) => {
                        Log.debug("PhotosListView -> Table update " + type + "images count: " + value.length)
                        setObjects(value)
                    })
                setSubscription(subscription)
                break;
            }
            case ServiceType.Dropbox: {
                const subscription = await subscribeImports(ServiceType.Dropbox, root, undefined, (value) => {
                    Log.debug("PhotosListView -> Table update " + type + "images count: " + value.length)
                    setObjects(value)
                })
                setSubscription(subscription)
                break;
            }
            case ServiceType.Camera: {
                const subscription = await subscribeImports(ServiceType.Camera, root, SaufotoObjectType.Image, (value) => {
                    Log.debug("PhotosListView -> Table update " + type + "images count: " + value.length)
                    setObjects(value)
                })
                setSubscription(subscription)
                break;
            }
            case ServiceType.Saufoto: {
                let subscription
                if (albums) {
                    subscription =  await subscribeAlbums((value) => {
                            Log.debug("PhotosListView -> Table update " + type + " albums count: " + value.length)
                            setObjects(value)
                        })
                } else {
                    subscription =  await subscribeImages(isImport ? null:root, (value) => {
                        Log.debug("PhotosListView -> Table update " + type + " images count: " + value.length)
                        setObjects(value)
                    })
                }
                setSubscription(subscription)
                break;
            }
        }
    }, [])

    const updateDataSource = (images?: LoadImagesResponse) => {
        if( images !== undefined ) {
            Log.debug(type + " PhotosListView -> complete load images hasMore: " + images.hasMore);
            setLoading(false)
            setHasMore(images.hasMore)
        }
    }

    const fetchData = async () => {
         if(type != ServiceType.Saufoto ) {
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

    useEffect(() => {
        if (title !== null) {
            navigation.setOptions({title: title})
        }
        setTimeout( () => {
            initData().catch((err) => {
                Log.error("PhotosListView -> Loading " + type + " images error: " + err)
            })
            Log.debug("PhotosListView -> " + type + " global event isLoading: " + isLoading)
            fetchData().then((response) => {
                // Log.debug("Load " + type + "images :" + JSON.stringify(images))
                updateDataSource(response)
            }).catch((err) => {
                Log.error("PhotosListView -> Loading " + type + " images error: " + err)
            })
        }, 1000)
    }, []);

    /*
     Error processing
     */
    const [error, setError] = useState<any | null>(null);
    useEffect(() => {
        const auth = async (service: ServiceType) => {
            await authorizeWith(service)
        }

        if (error !== null && error.reason === 'Not Authorized') {
            auth(error.provider).then(() => {
                setError(null)
            }).catch((err) => {
                Log.error("PhotosListView -> Authorize " + type + " error: " + err)
            })
        }
    }, [error]);

    const onError = (err: any) => {
        if( error ===  null ) {
            setError(err)
        }
    }

    const getRenderMode = ():CollectionItemRenderStates => {
        if(actionBarVisible) return CollectionItemRenderStates.GallerySelect
        if(albums && !isImport) return CollectionItemRenderStates.GalleryAlbums
        if(isImport) {
            if( albums ) {
                return albumsPreview ? CollectionItemRenderStates.ImportAlbumsSelect:CollectionItemRenderStates.ImportAlbums
            }
            if(type === ServiceType.Saufoto)  return CollectionItemRenderStates.GallerySelect
            return CollectionItemRenderStates.Import
        }
        return CollectionItemRenderStates.Gallery
    }
    /*
    SpeedyList support preview mode is off (isPreview= false)
     */
    const [albumsPreview, setAlbumsPreview] = useState(true);
    const renderItem = useCallback<SpeedyListItemRenderer<ImportObject|SaufotoImage>>((props ) => {
        const selection = isImport || actionBarVisible
        Log.debug("PhotosListView ->  Render item selection:" + selection + " import: " + isImport + " actionBar: " + actionBarVisible)
        return <CollectionListItem renderMode={getRenderMode()} item={props.item} onSelected={onItemSelected} dataProvider={type} index={props.index} onError={onError} debug={true}/>
    },[albumsPreview,actionBarVisible])

    const compareItems = (a: ImportObject, b: ImportObject):boolean => {
        return a?.id === b?.id;
    }

    const keyItem = (meta: SpeedyListItemMeta<ImportObject>):string => {
        return meta.item?.id !== undefined ?  meta.item?.id:"undefined"
    }

    //Top level item selection processing
    const onItemSelected = (item: ImportObject|SaufotoImage|SaufotoAlbum, index: number) => {
        if( type === ServiceType.Saufoto ) {
            if( albums ) {
                navigation.push('SaufotoAlbumImages', {albumId: item.id, title:item.title})
            } else {
                const albumId = route.params?.albumId != null ? route.params?.albumId : null
                navigation.push('PreviewImages', {albumId: albumId, first: index, title:item.title})
            }
        } else {
            if(!isImport) {
                navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item), first:index, title:item.title})
            } else if(albums) {
                navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item), title:item.title})
            }
        }
    };

    //In Import screen Albums mode toggle 'Browse/select'
    const toggleSwitch = useCallback( (state: boolean) => {
        Log.debug("PhotosListView -> "+ type + " albums view mode: " + albumsPreview + " -> " + state)
        if(state != albumsPreview) {
            setAlbumsPreview(state)
        }
    },[albumsPreview]);

    const selectionBarAction = useCallback( (action: ActionEvents) => {
        Log.debug("PhotosListView -> " +type + " selection bar action: " + action)
        // @ts-ignore
        PubSub.publish(eventsSubscriber, createAction(action))
    },[albumsPreview]);

    const footer = (hasMore: boolean) => {
        if(hasMore) {
            return (
                <View style={styles.footerStyle}>
                    <ProgressCircle size={30} indeterminate={true}/>
                </View>
            );
        } else {
            return null
        }
    };

    /*
   Carousel support preview mode is on (isPreview= true) and Import mode is off (isImport = false)
    */
    const [indexSelected, setIndexSelected] = useState(0);
    const carouselRef = useRef<any>();
    const flatListRef = useRef<any>();

    const renderFlatItem = useCallback((props: { item: ImportObject | SaufotoImage; index: any; })  => {
        const isSelected = props.index === indexSelected
        //Log.debug("selected " + props.index + " selected " + indexSelected + " " + isSelected)
        return <CollectionListItem renderMode={CollectionItemRenderStates.ImportFlatList} item={props.item} onSelected={(item: ImportObject|SaufotoImage|SaufotoAlbum, index: number) => {carouselRef?.current?.snapToItem(index)}} dataProvider={type} index={props.index} onError={onError} debug={true} isSelected={ isSelected }/>
    },[indexSelected])

    const renderCarousel = useCallback((props: { item: SaufotoImage; index: any; })  => {
        return <CollectionPreviewItem  item={props.item}  dataProvider={type} index={props.index} onError={onError} debug={true} uri={null}/>
    },[indexSelected])

    const onCarouselSnap = (index:number) => {
        setIndexSelected(index);
        const THUMB_SIZE = FlatListItemSizes[type].small.width
        const selectedItemPosition = index * THUMB_SIZE - THUMB_SIZE / 2
        if (selectedItemPosition > screenWidth / 2) {
           flatListRef?.current?.scrollToOffset({
             offset: selectedItemPosition - screenWidth / 2 + THUMB_SIZE ,
             animated: true,
           });
         } else {
           flatListRef?.current?.scrollToOffset({
             offset: 0,
             animated: true,
           });
        }
    }


    const height = albums ? FlatListItemSizes[type].album.layout : FlatListItemSizes[type].image.layout
    Log.debug("PhotosListView ->  render")
    return isAddAlbum ? (
            <NewAlbumDialog onOk={addAlbum} onCancel={ () => setIsAddAlbum( false)}/>):( !isPreview ? (
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
                    <AlbumsPreviewBar albums={albums} callback={toggleSwitch} state={albumsPreview} isImport={isImport}/>
                    <SelectionBar isVisible={actionBarVisible} callback={selectionBarAction}/>
                </SafeAreaView>
        )
        :
        (
            <SafeAreaView style={styles.container}>
                <Carousel
                    slideStyle={{ width: screenWidth }}
                    ref={carouselRef}
                    layout='default'
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
                renderItem={renderFlatItem}
            />
        </SafeAreaView>
    ))
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
    title: {
        flexDirection:'row',
        fontSize: 18,
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
    selectBarStyle: {
        flexDirection:'row',
        height: 46,
        width: '100%',
        borderColor:theme.colors.tint,
        elevation:5,
        backgroundColor: Colors.light.tabBackground,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
