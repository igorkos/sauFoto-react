import {SaufotoImage} from "../../data/watermelon/SaufotoImage";
import {ServiceType} from "../../data/ServiceType";
import {Component} from "react";
import {Placeholders} from "../../styles/Images";
import {Log} from "../../utils/log";
import {DataSourceProvider} from "../../data/DataSourceProvider";
import * as React from "react";
import PhotoView from "react-native-photo-view";

interface PreviewSourceState {
    id:string
    index: number
    uri: string | null
    error: boolean
    title: string | null | undefined
    debug: boolean
}

interface PreviewSourceProps {
    item: SaufotoImage
    index: any;
    uri: string | null
    debug?: boolean | undefined
    dataProvider: ServiceType
    onError: (error: any) => void
}


export default class CollectionPreviewItem extends Component<PreviewSourceProps, PreviewSourceState> {

    constructor(props: PreviewSourceProps) {
        super(props);
        this.state = {
            id: "",
            index: -1,
            uri: null,
            error: false,
            title: null,
            debug: props.debug === undefined ? false:props.debug,
        }
        this.log("Create list item for id: "+ props.item.id)
    }

    static _updateState(props:PreviewSourceProps): PreviewSourceState {
        return  {
            id: props.item.id,
            index: props.index,
            uri: props.uri,
            error: false,
            title: props.item.title,
            debug: props.debug === undefined ? false:props.debug,
        }
    }

    shouldComponentUpdate(nextProps: PreviewSourceProps, nextState : PreviewSourceState): boolean {
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
        this.log("Should update no change id: "+ this.state.id)
        return false
    }

    static getDerivedStateFromProps(props: PreviewSourceProps, state: PreviewSourceState) {
        if (props.item.id !== state.id) {
           // Log.debug("CollectionViewItem -> Update item id: "+ state.uri)
            return CollectionPreviewItem._updateState(props)
        }
        return null;
    }

    componentDidMount() {
        if( this.state.uri === null) {
            const fetchImage = async () => {
                await DataSourceProvider.getImageData(this.props.dataProvider, this.props.item).then((src) => {
                    this.log("Loaded image  for: " + this.state.id + " uri: " + src)
                    this.setState({uri:src});
                })
            }
            fetchImage().catch((err) => {
                this.log("Loading image (" + this.state.id + ") error:" + err, 'error')
                this.setState({ error: true });
                this.props.onError(err)
            });
        }
    }

    render() {
        this.log("Render id: "+ this.state.id)
        const source = this.state.error ? Placeholders.imageError:{uri:this.state.uri}
        return (
            <PhotoView
                source={source}
                minimumZoomScale={1}
                maximumZoomScale={10}
                androidScaleType="fitCenter"
                onLoad={() => this.log("Image loaded!" + this.props.index)}
                style={{flex: 1}} />
        )
    }

    log(message: string, level: string = 'debug') {
        if(this.props.debug) {
            switch (level) {
                case 'debug':{
                    Log.debug('CollectionPreviewItem ' + this.props.dataProvider + ' -> ' + message)
                    break;
                }
                default: {
                    Log.error('CollectionPreviewItem ' + this.props.dataProvider + ' ->' + message)
                }
            }
        }
    }
}
