import {Log} from "../../hooks/log";
import {BackHandler, Platform, SafeAreaView, StyleSheet, Switch, TouchableOpacity} from "react-native";
import {ProgressCircle, Text, View} from "../../components/Themed";
import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {theme} from "../../constants/themes";
import {DataSourceProvider, LoadImagesResponse} from "../../data/DataSourceProvider";
import {SaufotoObjectType,} from "../../data/SaufotoImage";
import {ServiceType} from "../../data/ServiceType";
import {FlatListItemSizes} from "../../constants/Layout";
import {authorizeWith} from "../../data/AuthorizationProvicer";
import { SpeedyList, SpeedyListItemMeta, SpeedyListItemRenderer } from "react-native-speedy-list"
import {database} from "../../index";
import {ImportObject} from "../../data/watermelon/ImportObject";
import CollectionListItem from "../CollectionListItem";
import {Subscription} from "rxjs";
import {Q} from "@nozbe/watermelondb";
import {useFocusEffect, useIsFocused} from "@react-navigation/native";

const PubSub = require('pubsub-js');

export const photosListView = (navigation: { push: (arg0: string, arg1: { albumId: string|null; first?: any; }) => void; goBack: () => void; }, route: { params: { albumId: string; first: number; } | undefined; }, type: ServiceType, albums: boolean, isImport: boolean, isPreview: boolean = false) => {
    const [isLoading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [albumsPreview, setAlbumsPreview] = useState(true);
    const [events, setEvent] = useState('');
    const [error, setError] = useState<any | null>(null);
    const [visible, setVisible] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [root] = useState<string | null>(route.params !== undefined ? (route.params.albumId === undefined ? null : route.params.albumId) : null);
    const [objects, setObjects] = useState<ImportObject[]>([])
    const [subscription, setSubscription] = useState<Subscription | null>(null)

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
         }
    }

    useEffect(() => {
        switch (events) {
            case 'importToGallery' : {
                fetchData().then((response) => {
                    // Log.debug("Load " + type + "images :" + JSON.stringify(images))
                    updateDataSource(response)
                }).catch((err) => {
                    Log.error("Loading " + type + "images error: " + err)
                })
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
                //objects = albums? useQuery(SaufotoAlbum):useQuery(SaufotoImage);
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

    const onItemSelected = (item: ImportObject, index: number) => {
        if(!isImport) {
            navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item), first:index})
        } else if(albums) {
            navigation.push(type+'AlbumImages', {albumId: DataSourceProvider.albumId(type, item)})
        }
    };

    const toggleSwitch = useCallback( (state: boolean) => {
        Log.debug(type + " albums view mode: " + albumsPreview + " -> " + state)
        if(state != albumsPreview) {
            setAlbumsPreview(state)
        }
    },[albumsPreview]);



    useEffect(() => {
        const auth = async () => {
            await authorizeWith(type)
        }
        if (error === 'Not Authorized') {
            auth().then(() => {
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

    // @ts-ignore
    const renderItem = useCallback<SpeedyListItemRenderer<ImportObject>>((props ) => {
        return <CollectionListItem  item={props.item} mode={albumsPreview} onSelected={onItemSelected} dataProvider={type} index={props.index} onError={onError} debug={true}/>
        },[albumsPreview])


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

    return (
        <SafeAreaView style={styles.container}>
                <SpeedyList<ImportObject>
                    scrollViewProps={{style:styles.container}}
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
        </SafeAreaView>)
}

/*


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
