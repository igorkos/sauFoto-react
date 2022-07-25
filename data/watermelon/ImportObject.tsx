import {Model} from "@nozbe/watermelondb";
import {date, field, reader, text, writer} from '@nozbe/watermelondb/decorators'
import {placeholderUri, ThumbData, thumbHeight, ThumbSize, thumbWith} from "../../constants/Images";
import ImageResizer from "react-native-image-resizer";
import {ServiceType} from "../ServiceType";
import {SaufotoObjectType, SaufotoSyncAction} from "./SaufotoImage";
import {getThumbs, thumbUri} from "./DataSourceUtils";

export class ImportObject extends Model {
    static table = 'ImportObject'

    @text('type') type!: string
    @text('origin') origin!: string
    @text('originId') originId!: string
    @text('parentId') parentId!: string
    @text('syncOp') syncOp!: string
    @text('title') title: string | undefined
    @text('originalUri') originalUri!: string
    @text('thumbs') thumbs: string | undefined
    @field('count') count: string | undefined
    @field('selected') selected!: boolean
    @text('keyItemId') keyItemId: string | undefined

    get smallThumb() : string | null {
        const thumbs =  this.origin == ServiceType.Dropbox ? this.getThumbUri(ThumbSize.THUMB_256):this.getThumbUri(ThumbSize.THUMB_128)
        if (thumbs != null) {
            return thumbs
        }
        switch (this.origin) {
            case ServiceType.Google: return null
            case ServiceType.Camera: return null
            case ServiceType.Dropbox: {
                if(this.type === SaufotoObjectType.Image) return null
                return placeholderUri.get('folder_blue.png') as string
            }
        }
        return null
    }

    getThumbUri(size: ThumbSize): string | null {
        return thumbUri(this.thumbs, size)
    }

    @writer async setLocalImageFile(value: string) {

    }

    @reader async getLocalImageFile(): Promise<string | null> {
        return null
    }

    @writer async setSelected(selected: boolean) {
        this.update( record => record.selected = selected)
    }

    @writer async setSyncOp(operation: SaufotoSyncAction) {
        this.update( record => record.syncOp = operation)
    }

    @writer async setThumbs(value: string) {
        return this.update(record => record.thumbs = value);
    }

    async createThumb(size:ThumbSize, uri:string): Promise<string> {
        const result = await ImageResizer.createResizedImage(uri, thumbWith(size), thumbHeight(size), 'JPEG', 100, 0)
        let thumbs = getThumbs(this.thumbs)
        if( thumbs == null) {
            thumbs = Array()
        }
        thumbs.push({size:size, uri:result.uri})
        await  this.setThumbs( JSON.stringify(thumbs))
        return result.uri
    }

    @reader async getOriginalUri(): Promise<string> {
        return this.originalUri
    }

    toString() :string {
        return "ImportObject (" + this.originId + "): " + JSON.stringify(this._raw)
    }
}

 export async function createThumb(size:ThumbSize, uri:string): Promise<string> {
    const result = await ImageResizer.createResizedImage(uri, thumbWith(size), thumbHeight(size), 'JPEG', 100, 0)
    const thumbs = Array()
    thumbs.push({size:size, uri:result.uri})
    return JSON.stringify(thumbs)
}
