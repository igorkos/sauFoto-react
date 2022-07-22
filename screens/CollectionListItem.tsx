import {SaufotoObjectType, SaufotoSyncAction} from "../data/SaufotoImage";
import { ImportObject} from "../data/watermelon/ImportObject";
import {ServiceType} from "../data/ServiceType";
import {Component} from "react";
import {getPlaceholder, Placeholders, thumbSize, ThumbSize} from "../constants/Images";
import {FlatListItemSizes} from "../constants/Layout";
import {Log} from "../hooks/log";
import {DataSourceProvider} from "../data/DataSourceProvider";
import {Text, View} from "../components/Themed";
import {Image, StyleSheet, TouchableOpacity} from "react-native";
import FastImage from "react-native-fast-image";
import * as React from "react";
import {theme} from "../constants/themes";

interface ImageSourceState {
    id:string
    index: number
    uri: string | null
    count: number
    type: SaufotoObjectType
    selected: boolean
    error: boolean
    title: string | null | undefined
    debug: boolean
    size: ThumbSize
    imageStyle: any
    mode: boolean
}

interface ImageSourceProps {
    item: ImportObject
    mode: boolean
    onSelected: (entry: ImportObject, index: number) => void
    onError: (error: any) => void
    index: any;
    dataProvider: ServiceType
    debug?: boolean | undefined
}


export default class CollectionListItem extends Component<ImageSourceProps, ImageSourceState> {

    constructor(props: ImageSourceProps) {
        super(props);
        this.state = {
            id: "",
            index: -1,
            uri: null,
            count: 0,
            mode: props.mode,
            type: SaufotoObjectType.None,
            selected: false,
            error: false,
            title: null,
            debug: props.debug === undefined ? false:props.debug,
            size: ThumbSize.THUMB_ORIGINAL,
            imageStyle: styles.imageStyle
        }
        this.log("Create list item for id: "+ props.item.id)
    }

    static _updateState(props:ImageSourceProps): ImageSourceState {
        return  {
            id: props.item.id,
            index: props.index,
            uri: props.item.smallThumb,
            count: props.item.count === undefined ? 0:+props.item.count,
            type: props.item.type  as SaufotoObjectType,
            selected: props.item.selected,
            error: false,
            title: props.item.title,
            mode: props.mode,
            debug: props.debug === undefined ? false:props.debug,
            size: thumbSize(props.item.type === SaufotoObjectType.Image ? FlatListItemSizes[props.dataProvider].image.width: FlatListItemSizes[props.dataProvider].album.width),
            imageStyle: props.item.type === 'album' ? {...styles.albumStyle,  height: FlatListItemSizes[props.dataProvider].album.height, width: FlatListItemSizes[props.dataProvider].album.width,}:
            {...styles.imageStyle,  height: FlatListItemSizes[props.dataProvider].image.height, width: FlatListItemSizes[props.dataProvider].image.width,}
        }
    }

    shouldComponentUpdate(nextProps: ImageSourceProps, nextState : ImageSourceState): boolean {
        if(this.state.uri !== nextState.uri){
            this.log("Should update 'uri' change id: "+ this.state.id)
            return true
        }
        if(this.state.id !== nextState.id){
            this.log("Should update 'id' change id: "+ this.state.id)
            return true
        }
        if(this.state.error !== nextState.error) {
            this.log("Should update 'error' change id: "+ this.state.id)
            return true
        }
        if(this.state.selected !== nextState.selected) {
            this.log("Should update 'selected' change id: "+ this.state.id)
            return true
        }
        if(this.state.count !== nextState.count) {
            this.log("Should update 'count' change id: "+ this.state.id)
            return true
        }
        if(this.state.mode !== nextState.mode) {
            this.log("Should update 'mode' change id: "+ this.state.id)
            return true
        }
        this.log("Should update no change id: "+ this.state.id)
        return false
    }

    static getDerivedStateFromProps(props: ImageSourceProps, state: ImageSourceState) {
        if (props.item.id !== state.id || props.mode !== state.mode) {
           // Log.debug("CollectionViewItem -> Update item id: "+ state.uri)
            return CollectionListItem._updateState(props)
        }
        return null;
    }

    componentDidMount() {
        if( this.state.uri === null) {
            this.log("Load thumb for: " + this.state.id)
            const fetchThumb = async () => {
                await DataSourceProvider.getThumbsData(this.props.dataProvider, this.props.item, this.state.size).then((src) => {
                    this.setState({uri:src});
                })
            }

            if (this.props.item.originalUri !== null) {
                fetchThumb().catch((err) => {
                    this.log("Loading thumb (" + this.state.id + ") error:" + err, 'error')
                    this.setState({ error: true });
                    this.props.onError(err)
                });
            }
        }
    }

    onItemSelected(){
        const media = this.props.item
        if(!this.state.error) {
            if (!this.props.mode) {
                this.props.onSelected(media, this.props.index)
            } else {
                 media.setSelected(!media.selected)
                 this.setState({ selected: media.selected });
            }
        }
    };

    selectShow(){
        const media = this.props.item
        if(media.syncOp === SaufotoSyncAction.Pending) {
            return getPlaceholder('sync_white.png')
        }
        if( this.state.selected ) {
            return getPlaceholder('asset_select_icon.png')
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
        this.log("Render id: "+ this.state.id)
        const source = this.state.error ? Placeholders.imageError:{uri:this.state.uri}
        return (
            <TouchableOpacity
                key={this.props.index}
                style={styles.container}
                onPress={() => {this.onItemSelected();}}>
                <FastImage
                    style={this.state.imageStyle}
                    source={source}
                    onError={ () => {
                        this.setState({ error: true });
                    }}>
                    <Image style={styles.selectStyle} source={this.selectShow()}/>
                </FastImage>
                <this.CaptionView title={this.state.title} count={this.state.count} type={this.state.type}/>
            </TouchableOpacity>
        )
    }

    log(message: string, level: string = 'debug') {
        if(this.props.debug) {
            switch (level) {
                case 'debug':{
                    Log.debug('CollectionViewItem ' + this.props.dataProvider + ' -> ' + message)
                    break;
                }
                default: {
                    Log.error('CollectionViewItem ' + this.props.dataProvider + ' ->' + message)
                }
            }
        }
    }
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
        marginRight:4,
        marginTop:4,
        zIndex: 5
    },
});
