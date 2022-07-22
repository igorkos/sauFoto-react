import {Model} from "@nozbe/watermelondb";
import {field, text, writer} from '@nozbe/watermelondb/decorators'
import {getPlaceholderUri, placeholderUri, ThumbData, thumbHeight, ThumbSize, thumbWith} from "../../constants/Images";
import ImageResizer from "react-native-image-resizer";
import {ServiceType} from "../ServiceType";
import {SaufotoObjectType} from "../SaufotoImage";
import {Image} from "react-native";

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


    _getThumbs(): ThumbData[] | null {
        const list = this.thumbs
        if (list != null) {
            return  JSON.parse(list) as ThumbData[]
        }
        return  null
    }

    get smallThumb() : string | null {
        const thumbs =  this.origin == ServiceType.Dropbox ? this.getThumbUri(ThumbSize.THUMB_256):this.getThumbUri(ThumbSize.THUMB_128)
        if (thumbs != null) {
            return thumbs
        }
        switch (this.origin) {
            case ServiceType.Google: return this.originalUri + '=' + ThumbSize.THUMB_128
            case ServiceType.Camera: return this.originalUri
            case ServiceType.Dropbox: {
                if(this.type === SaufotoObjectType.Image) return null
                return placeholderUri.get('folder_blue.png') as string
            }
        }
        return null
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

    @writer async setSelected(selected: boolean) {
        this.update( record => record.selected = selected)
    }

    @writer async createThumb(size:ThumbSize, uri:string): Promise<string> {
        const result = await ImageResizer.createResizedImage(uri, thumbWith(size), thumbHeight(size), 'JPEG', 100, 0)
        let thumbs = this._getThumbs()
        if( thumbs == null) {
            thumbs = Array()
        }
        thumbs.push({size:size, uri:result.uri})
        await this.update( record => record.thumbs = JSON.stringify(thumbs))
        return result.uri
    }
}
