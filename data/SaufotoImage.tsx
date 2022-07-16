
export interface SaufotoImage extends SaufotoMedia {

    /**
     * Edited Image url
     *
     */
    editedImageUrl: string  | null

    /**
     * Blockstack image url when image not synchronised or null for synchronised
     *
     */
    originalImageBSFile: string  | null

    /**
     * Blockstack edited image url when image not synchronised or null for synchronised
     *
     */
    editedImageBSFile: string | null

    /**
     * Date when image was added
     */
    dateAdded: Date | null

    /**
     * Image mime type
     */
    mime_type: string | null
}

export function saufotoImage():SaufotoImage {
    return {
        id: 'unknown',
        update: 'unknown',
        remoteSyncOp: 'unknown',
        origin: 'unknown',
        originId: 'unknown',
        type: 'image',
        uri: 'unknown',
        originalUri: 'unknown',
        placeHolderImage: 'image_placeholder.png',
        errorImage: 'error_load_image.png',
        title: null,
        selected: false,
        sync: false,
        dateTaken: null,
        editedImageUrl: null,
        originalImageBSFile: null,
        editedImageBSFile: null,
        dateAdded: null,
        mime_type: null
    }
}


export interface SaufotoAlbum extends SaufotoMedia {

    /**
     * Album cover image id
     */
    coverImage: string | null

    /**
     * Album Subtitle
     */
    subTitle: string | null

    /**
     * Album images count
     */
    count: number  | null

    /**
     * List of album images
     */
    images: Array<SaufotoImage>  | null

}

export function saufotoAlbum():SaufotoAlbum {
    return {
        id: 'unknown',
        update: 'unknown',
        remoteSyncOp: 'unknown',
        origin: 'unknown',
        originId: 'unknown',
        type: 'album',
        uri: 'unknown',
        originalUri: 'unknown',
        placeHolderImage: 'image_placeholder.png',
        errorImage: 'error_load_image.png',
        title: null,
        selected: false,
        sync: false,
        dateTaken: null,
        coverImage: null,
        subTitle: null,
        count: 0,
        images: null,
    }
}

export interface SaufotoMedia {
    /**
     *  Unique asset id
     *  Return primary key
     */
    id: string

    /**
     * Local import/export status
     * @see SyncState
     */
    update: string

    /**
     * Remote import/export status
     * @see SyncState
     */
    remoteSyncOp: string

    /**
     * Asset import origin
     * @see DataProvider
     */
    origin: string

    /**
     * Asset unique origin id
     */
    originId: string


    type: string

    /**
     * Album cover image Uri (read only)
     */
    uri: string  | null

    originalUri: string | undefined

    placeHolderImage: string | null

    errorImage: string | null
    /**
     *  Album title
     */
    title: string | null

    /**
     * Asset selected for import
     */
    selected: boolean

    /**
     * Asset in process of synchronization
     */
    sync: boolean

    /**
     * Asset creation Date
     */
    dateTaken: Date | null

}
