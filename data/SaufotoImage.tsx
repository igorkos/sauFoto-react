import {Realm, createRealmContext} from '@realm/react';
import {ServiceType} from "./ServiceType";
import {thumbData, ThumbData, thumbHeight, ThumbSize, thumbWith} from "../constants/Images";
import ImageResizer from "react-native-image-resizer";

export enum SaufotoObjectType {
    Image = 'image',
    Album = 'album'
}

export enum SaufotoSyncAction {
    None = 'none',
    Pending = 'pending'
}
export class SaufotoMedia  extends Realm.Object {
    _id!: Realm.BSON.ObjectId;

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
            _id: new Realm.BSON.ObjectId(),
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
            _id: new Realm.BSON.ObjectId(),
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

export class ServiceImportEntry extends Realm.Object {
    _id!: Realm.BSON.ObjectId
    sfObject?: Realm.BSON.ObjectId
    origin!: string
    originId!: string
    parentId?:  string | null
    syncOp!: string
    type!: string
    originalUri?: string | null
    thumbs!:string[]
    selected!: boolean
    title?: string | null
    count!: number

    static serviceImportEntry(origin: ServiceType, type: SaufotoObjectType, id: string, parentId: string | null, title: string | null, uri: string | null, count: number | null) {
        return {
            _id: new Realm.BSON.ObjectId(),
            type: type,
            origin: origin,
            originId: id,
            title: title,
            originalUri: uri,
            parentId: parentId,
            count: count
        }
    }

    getThumbUri(size: ThumbSize): string | null {
        for (let entry of this.thumbs) {
            const thumb = JSON.parse(entry) as ThumbData
            if( thumb.size == size) return thumb.uri
        }
        return null
    }

    async createThumb(size:ThumbSize, uri:string,  realm: Realm): Promise<string> {
        const result = await ImageResizer.createResizedImage(uri, thumbWith(size), thumbHeight(size), 'JPEG', 100, 0)
        realm.write(() => {
            this.thumbs.push(thumbData(size, result.uri))
        })
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
            thumbs: {type: 'list', objectType:'string', default: []},
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
            thumbs: {type: 'list', objectType:'string', default: []},
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
            thumbs: {type: 'list', objectType:'string', default: []},
            count:{type: 'int', default: 0},
        },
    };
}
export const realmConfig = {
    schema: [SaufotoImage, SaufotoAlbum, ServiceImportCamera, ServiceImportDropbox, ServiceImportGoogle],
};

export default createRealmContext(realmConfig);




