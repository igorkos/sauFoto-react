import {SaufotoObjectType, SaufotoSyncAction} from "./SaufotoImage";
import {Q} from "@nozbe/watermelondb";
import {ServiceType} from "../ServiceType";
import {database} from "../../index";
import {ImportObject} from "./ImportObject";
import {ThumbData, ThumbSize} from "../../constants/Images";

export async function addToTable(table: string, list: Array<any>,  origin: ServiceType, root: string, type: (item: any) => string, title: string, uri: string, keyItem?: string, count?: string ) {

    const collection = database.get<ImportObject>(table)

    const newItems = Array()
    for( let value of list) {
        const find =  await collection.query(
            Q.where('origin', origin),
            // @ts-ignore
            Q.where('originId', value.id),
            Q.where('parentId', root)).fetch()
        if( find.length == 0) {
             const entry = collection.prepareCreate(entry => {
                entry.type = type(value)
                entry.origin = origin
                // @ts-ignore
                entry.originId = value.id
                entry.title = value[title]
                entry.originalUri = value[uri] as string
                entry.parentId = root
                entry.syncOp = SaufotoSyncAction.None
                entry.keyItemId = keyItem === undefined ? null:value[keyItem]
                entry.count = count === undefined ? null:value[count]
                entry.selected = false
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
