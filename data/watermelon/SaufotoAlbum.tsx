import {Model} from "@nozbe/watermelondb";
import {Tables} from "./shema";
import {date, field, immutableRelation, reader, readonly, relation, text, writer} from "@nozbe/watermelondb/decorators";
import {placeholderUri, ThumbSize} from "../../styles/Images";
import {thumbUri} from "./DataSourceUtils";

// @ts-ignore
export class SaufotoAlbum extends Model {
    static table = Tables.Album
    // @ts-ignore
    static associations = {
        album_image: { type: 'has_many', foreignKey: 'album_id' },
    }
    @readonly @date('created_at') createdAt!: Date
    @text('type') type!: string
    @text('origin') origin!: string
    @text('syncOp') syncOp!: string
    @text('thumbs') thumbs: string | undefined
    @text('title') title: string | undefined
    @text('description') description: string | undefined

    @field('count') count!: number
    @field('selected') selected!: boolean

    @immutableRelation(Tables.Import, 'import_id') import!: any
    @relation(Tables.Image, 'keyItem') keyItem!: any

    @writer async setCount(count: number) {
        this.update( record => record.count = count )
    }

    @writer async setSelected(selected: boolean) {
        this.update( record => record.selected = selected)
    }

    @reader async getCount() {
        return this.count
    }

    async getOriginalUri(): Promise<string> {
        const key = await this.keyItem.fetch()
        if(key === null)  return placeholderUri.get('image_placeholder.png') as string
        return await key.getOriginalUri()
    }

    getThumbUri(size: ThumbSize): string | null {
        return thumbUri(this.thumbs, size)
    }

    get smallThumb() : string | null {
        return thumbUri(this.thumbs, ThumbSize.THUMB_256)
    }

    async createThumb(size:ThumbSize, uri:string): Promise<string> {
        const image = await this.keyItem.fetch()
        if(image === null)  return placeholderUri.get('image_placeholder.png') as string
        return await image.createThumb(size, uri)
    }

}
