import { appSchema, tableSchema } from '@nozbe/watermelondb'
import {SaufotoImage} from "./SaufotoImage";

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'ImportObject',
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
            name: 'SaufotoImage',
            columns: [
                {name: 'syncOp', type:  'string'},
                {name: 'type', type: 'string'},

                {name: 'thumbs', type: 'string', isOptional: true, isIndexed: true},
                {name: 'title', type: 'string'},
                {name: 'description', type: 'string', isOptional: true},
                {name: 'dateTaken', type: 'string', isOptional: true},
                {name: 'dateAdded', type: 'string'},
                {name: 'media_info', type: 'string', isOptional: true},

                {name: 'originalImageBSFile', type: 'string', isOptional: true},
                {name: 'editedImageBSFile', type: 'string', isOptional: true},

                {name: 'album_id', type: 'string'},
                {name: 'import_id', type: 'string', isIndexed: true},
                {name: 'origin', type: 'string'},
                {name: 'cashedData', type: 'string', isOptional: true},
            ],
        }),
        tableSchema({
            name: 'SaufotoAlbum',
            columns: [
                {name: 'syncOp', type:  'string', isIndexed: true},
                {name: 'type', type: 'string', isIndexed: true},

                {name: 'thumbs', type: 'string', isOptional: true, isIndexed: true},
                {name: 'title', type: 'string'},
                {name: 'description', type: 'string', isOptional: true},
                {name: 'dateAdded', type: 'string'},

                {name: 'count', type: 'number'},
                {name: 'images', type: 'string'},

                {name: 'import_id', type: 'string', isIndexed: true},
                {name: 'origin', type: 'string'},
            ],
        })
    ]
})
