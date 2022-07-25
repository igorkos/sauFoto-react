
import { ThumbSize } from "../../constants/Images";
import {Model} from "@nozbe/watermelondb";
import {children, date, field, immutableRelation, reader, relation, text, writer} from "@nozbe/watermelondb/decorators";
import {getThumbs, thumbUri} from "./DataSourceUtils";
import { ImportObject } from "./ImportObject";
import {MediaInfo} from "./MediaInfo";

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
    static table = 'SaufotoImage'
    // @ts-ignore
    static associations = {
        albums: {type: "belongs_to", key: "album_id"},
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
    @immutableRelation('ImportObject', 'import_id') import!: any
    @relation("SaufotoAlbum", "album_id") album: any;
    @text('origin') origin!: string
    @text('cashedData') cashedData!: string

    get smallThumb() : string | null {
        return thumbUri(this.thumbs, ThumbSize.THUMB_128)
    }

    @writer async addThumb(thumbs: string) {
        this.update( record => record.thumbs = thumbs )
    }

    @writer async setLocalImageFile(value: string) {
        this.update( record => record.cashedData = value )
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
    static table = 'SaufotoAlbum'
    // @ts-ignore
    static associations = {
        images: { type: 'has_many', foreignKey: 'album_id' },
    }
    @text('type') type!: string
    @text('syncOp') syncOp!: string
    @text('thumbs') thumbs: string | undefined
    @text('title') title: string | undefined
    @text('description') description: string | undefined
    @date('dateAdded') dateAdded!: Date
    @field('count') media_info!: number
    @text('origin') origin!: string

    @immutableRelation('ImportObject', 'import_id') import!: string
    @children("SaufotoImage") images: any
}
