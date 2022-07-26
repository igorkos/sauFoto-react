
import { ThumbSize } from "../../styles/Images";
import {Model, Q} from "@nozbe/watermelondb";
import {
    children,
    date,
    field,
    immutableRelation,
    lazy,
    reader,
    relation,
    text,
    writer
} from "@nozbe/watermelondb/decorators";
import {getThumbs, thumbUri} from "./DataSourceUtils";
import { ImportObject } from "./ImportObject";
import {MediaInfo} from "./MediaInfo";
import {database} from "../../index";
import {Tables} from "./shema";
import {Log} from "../../utils/log";

export enum SaufotoObjectType {
    None = 'none',
    Image = 'image',
    Album = 'album'
}

export enum SaufotoSyncAction {
    None = 'none',
    Pending = 'pending'
}

// @ts-ignore
export class SaufotoImage extends Model {
    static table = Tables.Image
    // @ts-ignore
    static associations = {
        album_image: {type: 'has_many', key: 'image_id'},
    }
    /**
     * Local import/export status
     * @see SyncState
     */
    @text('syncOp') syncOp!: string
    @text('type') type!: string
    @text('thumbs') thumbs: string | undefined
    @text('title') title: string | undefined
    @text('description') description: string | undefined
    @date('dateTaken') dateTaken: Date | undefined
    @date('dateAdded') dateAdded!: Date
    @text('media_info') media_info: string | undefined
    @text('originalImageBSFile') originalImageBSFile: string | undefined
    @text('editedImageBSFile') editedImageBSFile: string | undefined
    @text('origin') origin!: string
    @text('cashedData') cashedData!: string
    @field('selected') selected!: boolean

    @immutableRelation(Tables.Import, 'import_id') import!: any

    @lazy
    albums = this.collections
        .get(Tables.Album)
        .query(Q.on(Tables.AlbumImages, 'image_id', this.id));


    get smallThumb() : string | null {
        return thumbUri(this.thumbs, ThumbSize.THUMB_128)
    }

    @writer async addThumb(thumbs: string) {
        this.update( record => record.thumbs = thumbs )
    }

    @writer async setLocalImageFile(value: string) {
        this.update( record => record.cashedData = value )
    }

    @writer async setSelected(selected: boolean) {
        this.update( record => record.selected = selected)
    }

    @reader async getLocalImageFile(): Promise<string | null> {
        return this.cashedData === undefined ? null:this.cashedData
    }

    @reader async getMediaInfo(): Promise<MediaInfo | null> {
        return this.media_info === undefined ? null:JSON.parse(this.media_info)
    }

    @writer async setMediaInfo(info: MediaInfo) {
        this.update( record => record.media_info = JSON.stringify(info) )
    }


    @reader async getImport(): Promise<ImportObject> {
        return this.import.fetch()
    }

    getThumbUri(size: ThumbSize): string | null {
        return thumbUri(this.thumbs, size)
    }

    async getOriginalUri(): Promise<string> {
        if( this.originalImageBSFile === null) {
            if( this.cashedData === null) {
                const object = await this.getImport()
                return await object.getOriginalUri()
            }
            return this.cashedData!
        }
        return this.originalImageBSFile!
    }

    async createThumb(size:ThumbSize, uri:string): Promise<string> {
        if( this.originalImageBSFile === null) {
            const object = await this.getImport()
            return await object.createThumb(size, uri)
        }
        return this.originalImageBSFile!
    }
}

// @ts-ignore
export class SaufotoAlbum extends Model {
    static table = Tables.Album
    // @ts-ignore
    static associations = {
        album_image: { type: 'has_many', foreignKey: 'album_id' },
    }
    @text('type') type!: string
    @text('syncOp') syncOp!: string
    @text('thumbs') thumbs: string | undefined
    @text('title') title: string | undefined
    @text('description') description: string | undefined
    @date('dateAdded') dateAdded!: Date
    @field('count') count!: number
    @text('origin') origin!: string

    @immutableRelation(Tables.Import, 'import_id') import!: any

    @writer async setCount(count: number) {
        this.update( record => record.count = count )
    }

    @lazy
    images = this.collections
        .get(Tables.Image)
        .query(
            Q.on(Tables.AlbumImages, Q.where('album_id', this.id)));
}

// @ts-ignore
export class SaufotoAlbumImage extends Model {
    static table = Tables.AlbumImages
    // @ts-ignore
    static associations = {
        image: {type: 'belongs_to', foreignKey: 'image_id'},
        album: {type: 'belongs_to', foreignKey: 'album_id'},
    }

    @immutableRelation(Tables.Image, 'image_id') image!: any
    @immutableRelation(Tables.Album, 'album_id') album!: any
}

export async function subscribeImages( root: string | null, next?: ((value: SaufotoImage[]) => void) | null) {
    let subscription = null
    if( root === null) {
        subscription = database.get<SaufotoImage>(Tables.Image).query().observe().subscribe( next )
    } else {
        subscription = await database.get<SaufotoAlbumImage>(Tables.AlbumImages).query(Q.where('album_id', root)).observe().subscribe( async (value) => {
            Log.debug("Table update album_image count: " + value.length)
            const images = Array()
            for( let a of  value) {
                const image = await a.image.fetch()
                images.push(image)
            }
            if (next) {
                next(images)
            }
        })
    }
    return subscription
}

export async function subscribeAlbums(next?: ((value: SaufotoAlbum[]) => void)) {
    return database.get<SaufotoAlbum>(Tables.Album).query().observe().subscribe( next )
}
