import {ImportObject} from "./watermelon/ImportObject";
import {database} from "../index";
import {SaufotoImage, SaufotoObjectType, SaufotoSyncAction} from "./watermelon/SaufotoImage";
import {Tables} from "./watermelon/shema";

export namespace ImportProvider {
    export async function addEntries( entries: ImportObject[]) {
        const images = database.get<SaufotoImage>(Tables.Image)
        const newItems = Array()
        for( let value of entries) {
            const entry = images.prepareCreate(entry => {
                    entry.syncOp = SaufotoSyncAction.Pending
                    entry.title = value.title
                    entry.thumbs = value.thumbs
                    entry.import.set(value)
                    entry.type = SaufotoObjectType.Image
                    entry.origin = value.origin
                })
            value.prepareUpdate((entry) => {
                entry.selected = false
                entry.syncOp = SaufotoSyncAction.Pending
            })
            newItems.push(entry)
        }

        if( newItems.length > 0 ) {
            await database.write(async () => {
                await database.batch(...newItems)
                await database.batch(...entries)
            })
        }
    }

}
