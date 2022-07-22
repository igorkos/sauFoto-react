import {SaufotoObjectType} from "../SaufotoImage";
import {Q} from "@nozbe/watermelondb";
import {ServiceType} from "../ServiceType";
import {database} from "../../index";
import {ImportObject} from "./ImportObject";

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
            // const result = await ImageResizer.createResizedImage(value.baseUrl, thumbWith(ThumbSize.THUMB_128), thumbHeight(ThumbSize.THUMB_128), 'JPEG', 100, 0)
            // let thumbs = Array({size:ThumbSize.THUMB_128, uri:result.uri})
            const entry = collection.prepareCreate(entry => {
                entry.type = type(value)
                entry.origin = origin
                // @ts-ignore
                entry.originId = value.id
                entry.title = value[title]
                entry.originalUri = value[uri] as string
                entry.parentId = root
                entry.syncOp = 'none'
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
