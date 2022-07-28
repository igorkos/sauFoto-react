
import {ThumbSize} from "../../styles/Images";
import {Model, Q} from "@nozbe/watermelondb";
import {
    date,
    field,
    immutableRelation,
    lazy,
    reader, readonly,
    text,
    writer
} from "@nozbe/watermelondb/decorators";
import {thumbUri} from "./DataSourceUtils";
import { ImportObject } from "./ImportObject";
import {MediaInfo} from "./MediaInfo";
import {Tables} from "./shema";

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

    @readonly @date('created_at') createdAt!: Date
    @text('type') type!: string
    @text('origin') origin!: string
    @text('syncOp') syncOp!: string
    @text('thumbs') thumbs: string | undefined
    @text('title') title: string | undefined
    @text('description') description: string | undefined
    @date('dateTaken') dateTaken: Date | undefined
    @text('media_info') media_info: string | undefined
    @text('originalImageBSFile') originalImageBSFile: string | undefined
    @text('editedImageBSFile') editedImageBSFile: string | undefined
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
                const object = await this.import.fetch()
                return await object.getOriginalUri()
            }
            return this.cashedData!
        }
        return this.originalImageBSFile!
    }

    async createThumb(size:ThumbSize, uri:string): Promise<string> {
        if( this.originalImageBSFile === null) {
            const object = await this.import.fetch()
            return await object.createThumb(size, uri)
        }
        return this.originalImageBSFile!
    }
}

