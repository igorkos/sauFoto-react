import {SaufotoObjectType, SaufotoSyncAction} from "./SaufotoImage";
import {Q} from "@nozbe/watermelondb";
import {ServiceType} from "../ServiceType";
import {database} from "../../index";
import {createThumb, ImportObject} from "./ImportObject";
import {ThumbData, thumbHeight, ThumbSize, thumbWith} from "../../constants/Images";
import ImageResizer from "react-native-image-resizer";

export async function addToTable(table: string, list: Array<any>,  origin: ServiceType, root: string, type: (item: any) => string,
                                 title: string, uri: string, fetchThumb?:string, thumbSize?:ThumbSize, keyItem?: string, count?: string ) {

    const collection = database.get<ImportObject>(table)

    const newItems = Array()
    for( let value of list) {
        const find =  await collection.query(
            Q.where('origin', origin),
            Q.where('originId', value.id),
            Q.where('parentId', root)).fetch()
        if( find.length == 0) {
            const thumbs = fetchThumb !== undefined ? (await createThumb(thumbSize === undefined ? ThumbSize.THUMB_128:thumbSize, value[fetchThumb])):undefined
            const entry = collection.prepareCreate(entry => {
                entry.type = type(value)
                entry.origin = origin
                entry.originId = value.id
                entry.title = value[title]
                entry.originalUri = value[uri] as string
                entry.parentId = root
                entry.syncOp = SaufotoSyncAction.None
                if(keyItem !== undefined ) {
                    entry.keyItemId = value[keyItem]
                }
                if(count !== undefined ) {
                    entry.count = value[count]
                }
                entry.selected = false
                if( thumbs !== undefined ) {
                    entry.thumbs = thumbs
                }
            })
            newItems.push(entry)
        }
    }

    if( newItems.length > 0 ) {
        await database.write(async () => {
            await database.batch(...newItems)
            return true
        })
    }
    return newItems.length
}

export function getThumbs(thumbs: string | undefined): ThumbData[] | null {
    if (thumbs != null) {
        return  JSON.parse(thumbs) as ThumbData[]
    }
    return  null
}

export function thumbUri(thumbs: string | undefined, size: ThumbSize): string | null {
    const list = getThumbs(thumbs)
    if (list != null) {
        for( let thumb of list) {
            if (thumb.size >= size) return thumb.uri
        }
    }
    return null
}
