import {SaufotoImage, SaufotoObjectType, SaufotoSyncAction} from "../../data/watermelon/SaufotoImage";
import {ImportObject} from "../../data/watermelon/ImportObject";
import {ServiceType} from "../../data/ServiceType";
import * as React from "react";
import {Component} from "react";
import {getPlaceholder, Placeholders, thumbSize, ThumbSize} from "../../styles/Images";
import {FlatListItemSizes} from "../../styles/Layout";
import {Log} from "../../utils/log";
import {DataSourceProvider} from "../../data/DataSourceProvider";
import {Text, View} from "../../styles/Themed";
import {Image, StyleSheet, TouchableOpacity} from "react-native";
import FastImage from "react-native-fast-image";
import {theme} from "../../styles/themes";
import {SaufotoAlbum} from "../../data/watermelon/SaufotoAlbum";


export enum CollectionItemRenderStates {
    Gallery,
    GallerySelect,
    GalleryAlbums,
    Import,
    ImportAlbums,
    ImportAlbumsSelect,
    ImportFlatList,
}

function isSelectionEnabled(mode: CollectionItemRenderStates ): boolean {
    switch (mode) {
        case CollectionItemRenderStates.GallerySelect:
        case CollectionItemRenderStates.Import:
        case CollectionItemRenderStates.ImportAlbumsSelect: { return true}
        default: return false
    }
}

function isImport(mode: CollectionItemRenderStates ): boolean {
    switch (mode) {
        case CollectionItemRenderStates.ImportAlbums:
        case CollectionItemRenderStates.Import:
        case CollectionItemRenderStates.ImportAlbumsSelect: { return true}
        default: return false
    }
}

interface ImageSourceState {
    id:string
    index: number
    uri: string | null
    count: number
    selected: boolean
    error: boolean
    title: string | null | undefined
    debug: boolean
    size: ThumbSize
    imageStyle: any
    syncOp: SaufotoSyncAction
    isSelected?: boolean,
    timer: any | null,
    renderMode:CollectionItemRenderStates,
}

interface ImageSourceProps {
    item: ImportObject | SaufotoImage | SaufotoAlbum
    index: any;

    renderMode:CollectionItemRenderStates,
    dataProvider: ServiceType

    isSelected?: boolean,

    onSelected: (entry: ImportObject|SaufotoImage|SaufotoAlbum, index: number) => void
    onError: (error: any) => void
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
            selected: false,
            error: false,
            title: null,
            debug: props.debug === undefined ? false:props.debug,
            size: ThumbSize.THUMB_ORIGINAL,
            imageStyle: styles.imageStyle,
            syncOp: SaufotoSyncAction.None,
            isSelected: false,
            timer:  null,
            renderMode:CollectionItemRenderStates.Gallery
        }
        this.log("Create list item for id: "+ props.item.id)
    }

    static _imageStyle(props:ImageSourceProps) {
        if( props.renderMode ===  CollectionItemRenderStates.ImportFlatList) {
            if(props.isSelected) {
                return ({
                    ...styles.imageStyleSmallSelected,
                    height:FlatListItemSizes[props.dataProvider].small.height,
                    width: FlatListItemSizes[props.dataProvider].small.width,})

            } else {
                return {
                    ...styles.imageStyleSmall,
                    height: FlatListItemSizes[props.dataProvider].small.height,
                    width: FlatListItemSizes[props.dataProvider].small.width,
                }
            }
        }else {
           return (props.item.type as SaufotoObjectType === SaufotoObjectType.Album ) ? {...styles.albumStyle,  height: FlatListItemSizes[props.dataProvider].album.height, width: FlatListItemSizes[props.dataProvider].album.width,}:
                {...styles.imageStyle,  height: FlatListItemSizes[props.dataProvider].image.height, width: FlatListItemSizes[props.dataProvider].image.width,}
        }
    }
    static _updateState(props:ImageSourceProps): ImageSourceState {
        const type = props.item.type as SaufotoObjectType
        const size = thumbSize((type === SaufotoObjectType.Image) ? FlatListItemSizes[props.dataProvider].image.width: FlatListItemSizes[props.dataProvider].album.width)
        const imageStyle = CollectionListItem._imageStyle(props)
        return  {
            id: props.item.id,
            index: props.index,
            uri: props.item.smallThumb,
            // @ts-ignore
            count: (props.item.count !== undefined) ? props.item.count:0,
            selected: props.item.selected,
            error: false,
            title: props.item.title,
            debug: props.debug === undefined ? false:props.debug,
            size: size,
            imageStyle: imageStyle,
            syncOp: props.item.syncOp as SaufotoSyncAction,
            isSelected: props.isSelected,
            timer:null,
            renderMode: props.renderMode
        }
    }

    shouldComponentUpdate(nextProps: ImageSourceProps, nextState : ImageSourceState): boolean {
        if(this.state.isSelected !== nextState.isSelected) {
            this.log("Should update 'iSSelected' change id: "+ this.state.id)
            return true
        }
        if( nextState.uri !== this.state.uri){
            this.log("Should update 'uri' change id: "+ this.state.id)
            return true
        }
        if(this.state.id !== nextState.id){
            if( this.state.timer != null) {
                clearTimeout(this.state.timer);
                this.setState( {timer:null})
            }
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
        if(this.state.renderMode !== nextState.renderMode) {
            this.log("Should update 'renderMode' change id: "+ this.state.id)
            return true
        }
        //this.log("Should update no change id: "+ this.state.id)
        return false
    }

    static getDerivedStateFromProps(props: ImageSourceProps, state: ImageSourceState) {
        if (props.item.id !== state.id ||
            props.item.syncOp !== state.syncOp||
            props.isSelected !== state.isSelected ||
            ((props.item instanceof ImportObject) && props.item.selected !== state.selected) ||
            ((props.item instanceof SaufotoAlbum) && state.count !== props.item.count )) {
           // Log.debug("CollectionViewItem -> Update item id: "+ state.uri)
            return CollectionListItem._updateState(props)
        }
        return null;
    }

    _fetchThumb = async () => {
        if (this.props.item.getOriginalUri !== null) {
            await DataSourceProvider.getThumbsData(this.props.dataProvider, this.props.item, this.state.size).then((src) => {
                this.setState({uri: src});
            })
        }
    }

    _loadImageThumb() {
        if( this.state.uri === null) {
            this.log("Load thumb for: " + this.state.id)
            const timer = setTimeout( () => {
                this._fetchThumb().catch((err) => {
                    this.log("Loading thumb (" + this.state.id + ") error:" + err + 'raw:' + this.props.item.toString())
                    this.setState({ error: true });
                    this.props.onError(err)
                });
            }, 100)
            this.setState( {timer:timer})
        }
    }

    componentDidMount() {
        this.log("Did Mount for: " + this.state.id)
        this._loadImageThumb()
    }

    componentDidUpdate?(prevProps: ImageSourceProps, prevState: ImageSourceState, snapshot?: any) {
        this.log("Did Update for: " + this.state.id)
        this._loadImageThumb()
    }

    onItemSelected(){
        if(!this.state.error) {
            if (isSelectionEnabled(this.props.renderMode)){
                const media = this.props.item
                if(isImport(this.props.renderMode) && this.state.syncOp !== SaufotoSyncAction.None) return
                media.setSelected(!media.selected).then(() => {
                    this.setState({selected: media.selected})
                })
            } else {
                this.props.onSelected(this.props.item, this.props.index)
            }
        }
    };

    selectShow(){
        const media = this.props.item
        if( isSelectionEnabled(this.props.renderMode)) {
            if(this.state.selected) return getPlaceholder('asset_select_icon.png')
        }
        if(media.syncOp !== SaufotoSyncAction.None) return getPlaceholder('sync_white.png')
        return null
    }

    StatusView(props: {mode:CollectionItemRenderStates, source:any} ) {
        if( props.mode === CollectionItemRenderStates.ImportFlatList ) {
            return null
        }
        return (<Image style={styles.selectStyle} source={props.source}/>)
    }

    CaptionView(props: {title:string | null | undefined, count: number, type:SaufotoObjectType }) {
        return props.type === SaufotoObjectType.Album ? (
            <View style={{height:40, marginTop:5, marginBottom:2}}>
                <Text style={styles.caption}>{props.title}</Text>
                <Text style={styles.caption}>{props.count}</Text>
            </View>
        ):null
    }

    render() {
        const source = this.state.error ? (this.props.item.type === SaufotoObjectType.Image ? Placeholders.imageError:Placeholders.folderError) :{uri:this.state.uri}
        this.log("Render id: "+ this.state.id + " " + JSON.stringify(source))
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
                    <this.StatusView mode={this.props.renderMode}  source={this.selectShow()}/>
                </FastImage>
                <this.CaptionView title={this.state.title} count={this.state.count} type={this.props.item.type as SaufotoObjectType}/>
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
    imageStyleSmall: {
        flex: 1,
        borderWidth: 0.5,
    },
    imageStyleSmallSelected: {
        flex: 1,
        borderWidth: 1,
        borderColor:theme.colors.tint,
        elevation:1,
        marginEnd:2,
        marginStart:2
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
        height: 20,
        width: 20,
        marginRight:4,
        marginTop:4,
        zIndex: 5
    },
});
