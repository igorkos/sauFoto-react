
import {ServiceType} from "./ServiceType";
import {ThumbData, thumbHeight, ThumbSize, thumbWith} from "../constants/Images";
import ImageResizer from "react-native-image-resizer";

export enum SaufotoObjectType {
    None = 'none',
    Image = 'image',
    Album = 'album'
}

export enum SaufotoSyncAction {
    None = 'none',
    Pending = 'pending'
}
export class SaufotoMedia  {

    /**
     * Local import/export status
     * @see SyncState
     */
    update!: string;

    /**
     * Remote import/export status
     * @see SyncState
     */
    remoteSyncOp!: string;

    /**
     * Asset import origin
     * @see DataProvider
     */
    origin!: string;

    /**
     * Asset unique origin id
     */
    originId!: string


    type!: string

    /**
     * Album cover image Uri (read only)
     */
    uri?: string  | null

    originalUri?: string | null

    placeHolderImage!: string | null

    errorImage!: string | null
    /**
     *  Album title
     */
    title?: string | null

    /**
     * Asset selected for import
     */
    selected!: boolean

    /**
     * Asset in process of synchronization
     */
    sync!: boolean

    /**
     * Asset creation Date
     */
    dateTaken?: Date | null

}

export class SaufotoImage extends SaufotoMedia {
    /**
     * Edited Image url
     *
     */
    editedImageUrl?: string  | null

    /**
     * Blockstack image url when image not synchronised or null for synchronised
     *
     */
    originalImageBSFile?: string  | null

    /**
     * Blockstack edited image url when image not synchronised or null for synchronised
     *
     */
    editedImageBSFile?: string | null

    /**
     * Date when image was added
     */
    dateAdded?: Date | null

    /**
     * Image mime type
     */
    mime_type?: string | null

    static saufotoImage(): SaufotoImage {
        return {
            update: 'unknown',
            remoteSyncOp: 'unknown',
            origin: 'unknown',
            originId: 'unknown',
            type: SaufotoObjectType.Image,
            uri: 'unknown',
            originalUri: 'unknown',
            placeHolderImage: 'image_placeholder.png',
            errorImage: 'error_load_image.png',
            title: '',
            selected: false,
            sync: false,
            dateTaken: null,
            editedImageUrl: null,
            originalImageBSFile: null,
            editedImageBSFile: null,
            dateAdded: null,
            mime_type: null
        } as SaufotoImage
    }

    static schema = {
        name: 'SaufotoImage',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            update: 'string',
            remoteSyncOp: 'string',
            origin: 'string',
            originId: 'string',
            type: 'string',
            uri: 'string?',
            originalUri: 'string?',
            placeHolderImage: 'string?',
            errorImage: 'string?',
            title: 'string?',
            selected: 'bool',
            sync: 'bool',
            dateTaken: 'date?',
            editedImageUrl: 'string?',
            originalImageBSFile: 'string?',
            editedImageBSFile: 'string?',
            dateAdded: 'date?',
            mime_type: 'string?',
        },
    };
}

export class SaufotoAlbum extends SaufotoMedia {

    /**
     * Album cover image id
     */
    coverImage?: string | null

    /**
     * Album Subtitle
     */
    subTitle?: string | null

    /**
     * Album images count
     */
    count?: number  | null

    /**
     * List of album images
     */
    images!: SaufotoImage[]

    static saufotoAlbum():SaufotoAlbum {
        return {
            update: 'unknown',
            remoteSyncOp: 'unknown',
            origin: 'unknown',
            originId: 'unknown',
            type: SaufotoObjectType.Album,
            uri: 'unknown',
            originalUri: 'unknown',
            placeHolderImage: 'image_placeholder.png',
            errorImage: 'error_load_image.png',
            title: null,
            selected: false,
            sync: false,
            dateTaken: null,
            coverImage: null,
            subTitle: null,
            count: 0,
            images: Array(),
        } as SaufotoAlbum
    }

    static schema = {
        name: 'SaufotoAlbum',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            update: 'string',
            remoteSyncOp: 'string',
            origin: 'string',
            originId: 'string',
            type: 'string',
            uri: 'string?',
            originalUri: 'string?',
            placeHolderImage: 'string?',
            errorImage: 'string?',
            title: 'string?',
            selected: 'bool',
            sync: 'bool',
            dateTaken: 'date?',
            coverImage: 'string?',
            subTitle: 'string?',
            count: 'int',
            images: 'SaufotoImage[]',
        },
    };
}

export class ServiceImportEntry  {
    origin!: string
    originId!: string
    parentId?:  string | null
    syncOp!: string
    type!: string
    originalUri?: string | null
    thumbs?:string | null
    selected!: boolean
    title?: string | null
    count!: number

    static serviceImportEntry(origin: ServiceType, type: SaufotoObjectType, id: string, parentId: string | null, title: string | null, uri: string | null, count: number | null) {
        return {
            type: type,
            origin: origin,
            originId: id,
            title: title,
            originalUri: uri,
            parentId: parentId,
            count: count
        }
    }

    _getThumbs(): ThumbData[] | null {
        const list = this.thumbs
        if (list != null) {
            return  JSON.parse(list) as ThumbData[]
        }
        return  null
    }

    getThumbUri(size: ThumbSize): string | null {
        const thumbs = this._getThumbs()
        if (thumbs != null) {
            for( let thumb of thumbs) {
                if (thumb.size == size) return thumb.uri
            }
        }
        return null
    }

    async createThumb(size:ThumbSize, uri:string): Promise<string> {
        const result = await ImageResizer.createResizedImage(uri, thumbWith(size), thumbHeight(size), 'JPEG', 100, 0)
        let thumbs = this._getThumbs()
        if( thumbs == null) {
            thumbs = Array()
        }
        thumbs.push({size:size, uri:result.uri})

        return result.uri
    }
}

export class ServiceImportCamera extends ServiceImportEntry {
    static schema = {
        name: 'ServiceImportCamera',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            type: 'string',
            origin: 'string',
            originId: 'string',
            parentId: {type: 'string?', default: null},
            sfObject: {type: 'objectId?', default: null},
            syncOp:  {type: 'string', default: SaufotoSyncAction.None},
            title: {type: 'string?', default: null},
            originalUri:  {type: 'string?', default: null},
            thumbs: {type: 'string?', default: null},
            count:{type: 'int', default: 0},
        },
    };
}

export class ServiceImportDropbox extends ServiceImportEntry {
    static schema = {
        name: 'ServiceImportDropbox',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            type: 'string',
            origin: 'string',
            originId: 'string',
            parentId: {type: 'string?', default: null},
            sfObject: {type: 'objectId?', default: null},
            syncOp:  {type: 'string', default: SaufotoSyncAction.None},
            title: {type: 'string?', default: null},
            originalUri:  {type: 'string?', default: null},
            thumbs: {type: 'string?', default: null},
            count:{type: 'int', default: 0},
        },
    };
}

export class ServiceImportGoogle extends ServiceImportEntry {
    static schema = {
        name: 'ServiceImportGoogle',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            type: 'string',
            origin: 'string',
            originId: 'string',
            parentId: {type: 'string?', default: null},
            sfObject: {type: 'objectId?', default: null},
            syncOp:  {type: 'string', default: SaufotoSyncAction.None},
            title: {type: 'string?', default: null},
            originalUri:  {type: 'string?', default: null},
            thumbs: {type: 'string?', default: null},
            count:{type: 'int', default: 0},
        },
    };
}





