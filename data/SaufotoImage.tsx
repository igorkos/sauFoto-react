export interface SaufotoImage extends SaufotoMedia {

    /**
     * Edited Image url
     *
     */
    editedImageUrl?: string

    /**
     * Blockstack image url when image not synchronised or null for synchronised
     *
     */
    originalImageBSFile?: string

    /**
     * Blockstack edited image url when image not synchronised or null for synchronised
     *
     */
    editedImageBSFile?: string

    /**
     * Date when image was added
     */
    dateAdded: Date

    /**
     * Image mime type
     */
    mime_type?: string
}

export interface SaufotoAlbum extends SaufotoMedia {

    /**
     * Album cover image id
     */
    coverImage?: string

    /**
     * Album Subtitle
     */
    subTitle?: string

    /**
     * Album images count
     */
    count: number

    /**
     * List of album images
     */
    images: Array<SaufotoImage>

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

    /**
     * Type Album
     * @see AssetType.Album
     */
    type: string

    /**
     * Album cover image Uri (read only)
     */
    uri: string

    originalUri: string

    placeHolderImage: string
    /**
     *  Album title
     */
    title?: string

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
    dateTaken?: Date

}
