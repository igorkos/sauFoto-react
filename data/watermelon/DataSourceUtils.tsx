import {SaufotoImage, SaufotoObjectType, SaufotoSyncAction} from "./SaufotoImage";
import {Q} from "@nozbe/watermelondb";
import {ServiceType} from "../ServiceType";
import {database} from "../../index";
import {createThumb, ImportObject} from "./ImportObject";
import {ThumbData, thumbHeight, ThumbSize, thumbWith} from "../../styles/Images";
import ImageResizer from "react-native-image-resizer";
import {date, field, text} from "@nozbe/watermelondb/decorators";
import {Tables} from "./shema";
import {Log} from "../../utils/log";
import {SaufotoAlbum} from "./SaufotoAlbum";
import {SaufotoAlbumImage} from "./SaufotoAlbumImage";

export async function addToTable(list: Array<any>,  origin: ServiceType, root: string, type: (item: any) => string,
                                 title: string, uri: string, fetchThumb?:string, thumbSize?:ThumbSize, keyItem?: string, count?: string ) {

    const collection = database.get<ImportObject>(Tables.Import)

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

export async function addSaufotoAlbum(title:string) {
    const collection = database.get<SaufotoAlbum>(Tables.Album)
    await database.write(async () => {
        await collection.create(entry => {
            entry.type = SaufotoObjectType.Album
            entry.syncOp = SaufotoSyncAction.Pending
            entry.title = title
            entry.origin = ServiceType.Saufoto
            entry.count = 0
        })
    })
}

export async function addImagesToAlbum(list: SaufotoImage[], albumId: string) {
    const collection = database.get<SaufotoAlbumImage>(Tables.AlbumImages)
    const album = await database.get<SaufotoAlbum>(Tables.Album).find(albumId)
    const newItems = Array()
    for( let value of list) {
        const find =  await collection.query(
            Q.where('album_id', albumId),
            Q.where('image_id', value.id)).fetch()
        if( find.length == 0) {
            const entry = collection.prepareCreate(entry => {
                entry.image.set(value)
                entry.album.set(album)
            })
            newItems.push(entry)
        }
        value.prepareUpdate((entry) => {
            entry.selected = false
        })
    }

    if( newItems.length > 0 ) {
        await database.write(async () => {
            if(album.count === 0) {
                album.update( record => record.keyItem.set(list[0]))
            }
            await database.batch(...newItems)
            await database.batch(...list)
            await album.update( record => record.count = album.count + newItems.length)
        })
    }
}

export async function deleteImages(list: SaufotoImage[], albumID: string | null) {
    const collection = database.get<SaufotoAlbumImage>(Tables.AlbumImages)
    const deleteFromAlbums = Array()
    for( let value of list) {
        let find
        if(albumID === null) {
            find = await collection.query(Q.where('image_id', value.id)).fetch()
        } else {
            find = await collection.query(Q.where('image_id', value.id), Q.where('album_id', albumID)).fetch()
        }
        if( find.length > 0) {
            for(let item of find) {
                item.prepareMarkAsDeleted()
            }
            deleteFromAlbums.push(...find)
        }
        if( albumID === null) {
            value.prepareMarkAsDeleted()
        } else {
            value.prepareUpdate((entry) => {
                entry.selected = false
            })
        }
    }

    const album = albumID !== null ? await database.get<SaufotoAlbum>(Tables.Album).find(albumID):undefined

    await database.write(async () => {
        await database.batch(...deleteFromAlbums)
        if( albumID === null) {
            await database.batch(...list)
        } else {
            await album?.update( record => record.count = album.count - deleteFromAlbums.length)
        }
    })
}

export async function deleteAlbum(albumID: string) {
    const collection = database.get<SaufotoAlbumImage>(Tables.AlbumImages)
    const deleteImages = await collection.query(Q.where('album_id', albumID)).fetch()
    deleteImages.forEach( entry => {
        entry.prepareMarkAsDeleted()
    })

    const album = await database.get<SaufotoAlbum>(Tables.Album).find(albumID)
    album.prepareMarkAsDeleted()

    await database.write(async () => {
        await database.batch(...deleteImages)
        await database.batch(album)
    })
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
