import { appSchema, tableSchema } from '@nozbe/watermelondb'

export enum Tables{
    Import = 'import_object',
    Image = 'image',
    Album = 'album',
    AlbumImages = 'album_image',
}

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'import_object',
            columns: [
                {name: 'type', type: 'string'},
                {name: 'origin', type: 'string'},
                {name: 'originId', type: 'string'},
                {name: 'keyItemId', type: 'string', isOptional: true},
                {name: 'parentId', type: 'string'},
                {name: 'syncOp', type: 'string'},
                {name: 'title', type: 'string', isOptional: true},
                {name: 'originalUri', type: 'string', isOptional: true},
                {name: 'thumbs', type: 'string', isOptional: true},
                {name: 'count', type: 'string', isOptional: true},
                {name: 'selected', type: 'boolean'},
                {name: 'media_info', type: 'string', isOptional: true},
            ]
        }),
        tableSchema({
            name: 'image',
            columns: [
                {name: 'syncOp', type:  'string'},
                {name: 'type', type: 'string'},

                {name: 'thumbs', type: 'string', isOptional: true, isIndexed: true},
                {name: 'title', type: 'string'},
                {name: 'description', type: 'string', isOptional: true},
                {name: 'dateTaken', type: 'string', isOptional: true},
                {name: 'media_info', type: 'string', isOptional: true},

                {name: 'originalImageBSFile', type: 'string', isOptional: true},
                {name: 'editedImageBSFile', type: 'string', isOptional: true},

                {name: 'import_id', type: 'string', isIndexed: true},

                {name: 'origin', type: 'string'},
                {name: 'cashedData', type: 'string', isOptional: true},

                {name: 'selected', type: 'boolean'},
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'album',
            columns: [
                {name: 'syncOp', type:  'string', isIndexed: true},
                {name: 'type', type: 'string', isIndexed: true},

                {name: 'thumbs', type: 'string', isOptional: true, isIndexed: true},
                {name: 'title', type: 'string'},
                {name: 'description', type: 'string', isOptional: true},

                {name: 'count', type: 'number'},
                {name: 'images', type: 'string'},

                {name: 'import_id', type: 'string', isIndexed: true},
                {name: 'origin', type: 'string'},

                {name: 'keyItem', type: 'string'},

                {name: 'selected', type: 'boolean'},
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'album_image',
            columns: [
                {name: 'album_id', type: 'string', isIndexed: true},
                {name: 'image_id', type: 'string', isIndexed: true},
                { name: 'created_at', type: 'number' },
            ]
        }),
    ]
})
