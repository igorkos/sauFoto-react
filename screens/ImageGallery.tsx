import * as React from 'react';
import { RootTabScreenProps } from './drawer/types';
import {photosListView} from "./drawer/PhotosCollectionList";
import {ServiceType} from "../data/ServiceType";
import {theme} from "../constants/themes";
import {NavigationDrawerBack, NavigationDrawerLeft} from "../components/NavigationBar/DrawerButtons";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useEffect, useMemo, useState} from "react";
import {
    BackHandler,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Switch,
    TouchableOpacity
} from "react-native";
import {DataSourceProvider, LoadImagesResponse} from "../data/DataSourceProvider";
import {Log} from "../hooks/log";
import SaufotoContext, {SaufotoAlbum, SaufotoImage, SaufotoObjectType, ServiceImportEntry} from "../data/SaufotoImage";
import {getPlaceFolder, thumbSize} from "../constants/Images";
import {FlatListItemSizes, screenHeight, screenWidth} from "../constants/Layout";
import {ProgressCircle, Text, View} from "../components/Themed";
import Colors from "../constants/Colors";
import Carousel from "react-native-snap-carousel";
import PhotoView from "react-native-photo-view";
import {HeaderBackButton} from "@react-navigation/elements";
import FastImage from "react-native-fast-image";
// @ts-ignore
import InViewPort from "@coffeebeanslabs/react-native-inviewport"
const {useRealm, useQuery} = SaufotoContext;

const Stack = createNativeStackNavigator();
// @ts-ignore
export function GalleryImagesNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Group>
                <Stack.Screen name="SaufotoImages" component={SaufotoGalleryScreen} options={{
                    headerShown: true,
                    title: "Gallery",
                    headerStyle: {backgroundColor: theme.colors.headerBackground,},
                    headerTintColor: theme.colors.text,
                    headerLeft: () => (
                        <NavigationDrawerLeft navigationProps={navigation} />
                    ),
                }}/>
            </Stack.Group>
        </Stack.Navigator>
    );
}
// @ts-ignore
function SaufotoGalleryScreen({ navigation, route }){
    return renderListView(navigation, route, ServiceType.Saufoto, false, false)
}
// @ts-ignore
export function SaufotoGalleryPreviewScreen({ navigation, route }) {
    return renderListView(navigation, route, ServiceType.Saufoto, false, false, true)
}

const renderListView = (navigation: { push: (arg0: string, arg1: { albumId: string|null; first?: any; }) => void; goBack: () => void; }, route: { params: { albumId: string; first: number; } | undefined; }, type: ServiceType, albums: boolean, isImport: boolean, isPreview: boolean = false) => {
    const [visible, setVisible] = useState(true);
    const [root] = useState<string | null>(route.params !== undefined ? (route.params.albumId === undefined ? null : route.params.albumId) : null);
    const [first] = useState<number>(route.params !== undefined ? (route.params.first === undefined ? 0 : route.params.first) : 0);
    const realmInst = useRealm()
    const [realm, setRealm] = useState<Realm>(realmInst)
    const [objects, setObjects] = useState<Realm.Results<Realm.Object>>()


    if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', function () {
            return false;
        });
    }

    const imageUri = async (item: ServiceImportEntry) => {
        const size = thumbSize(FlatListItemSizes[type].image.width)
        return await DataSourceProvider.getThumbsData(realm, type, item, size)
    }


    const initData = async () => {
        //objects = albums? useQuery(SaufotoAlbum):useQuery(SaufotoImage);
    }

    useEffect(() => {
        initData().catch((err) => {
            Log.error(" Init data error: " + err)
        });
    }, []);


    // @ts-ignore
    const renderList = ({item, index}) => {return (
        // @ts-ignore
        <ImageSource item={item} getThumbUri={imageUri} mode={albumsPreview} onSelected={onItemSelected} dataProvider={type} isImport={isImport} index={index}/>
    )}

    const checkVisible = (isVisible: boolean | ((prevState: boolean) => boolean)) => {
        if(visible !== isVisible) {
            setVisible(isVisible);
            Log.debug(type + " albums: " + albums + " is in focus: " + visible)
        }
    }

    const memoizedValue = useMemo(() => renderList, [objects]);

    const height = albums ? FlatListItemSizes[type].album.layout : FlatListItemSizes[type].image.layout
    return !isPreview ? (
        <InViewPort onChange={(isVisible: boolean | ((prevState: boolean) => boolean)) => checkVisible(isVisible)} style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    // @ts-ignore
                    data={objects}
                    getItemLayout={(data, index) => (
                        {length: height, offset: height * index, index}
                    )}
                    renderItem={renderList}
                    numColumns={(albums ? 2 : 3)}
                    initialNumToRender={21}
                    onEndReachedThreshold={0.5}
                    keyExtractor={(item, index) => index.toString()}
                />
            </SafeAreaView>
        </InViewPort>
    ):(
        <View style={{ flex: 1, backgroundColor:Colors.light.black, alignItems: 'center'}} >
            <StatusBar hidden={true} />
            <InViewPort onChange={(isVisible: boolean | ((prevState: boolean) => boolean)) => checkVisible(isVisible)} style={{ flex: 1, backgroundColor:Colors.light.black, alignItems: 'flex-start'}}>
                <Carousel
                    slideStyle={{ width: screenWidth }}
                    layout='default'
                    // @ts-ignore
                    data={objects}
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
                            source={{uri:item.originalUri as string}}
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


const ImageSource = (props: { item: SaufotoAlbum | SaufotoImage; isImport: any; getThumbUri: (arg0: any) => Promise<any>; mode: any; onSelected: (arg0: SaufotoAlbum | SaufotoImage, arg1: number) => void; index: any; dataProvider: ServiceType; }) => {
    const [uri, setUri] = useState<string | null>();
    const [type] = useState(props.item.type);
    const [isImport] = useState(props.isImport);
    const [selected, setSelected] = useState(props.item.selected);
    const [error, setError] = useState(false);
    const realm = useRealm()
    const media = type === 'album' ? (props.item as SaufotoAlbum):(props.item as SaufotoImage)

    const fetchThumb = async (source: string | undefined) => {
        await props.getThumbUri(media).then( (src) => {
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
        if(media.update === 'pending') {
            return getPlaceFolder('sync_white.png')
        }
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

