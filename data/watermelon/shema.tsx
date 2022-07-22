import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'ImportObject',
            columns: [
                {name: 'type', type: 'string', isIndexed: true},
                {name: 'origin', type: 'string'},
                {name: 'originId', type: 'string', isIndexed: true},
                {name: 'keyItemId', type: 'string', isOptional: true},
                {name: 'parentId', type: 'string'},
                {name: 'syncOp', type: 'string'},
                {name: 'title', type: 'string', isOptional: true},
                {name: 'originalUri', type: 'string', isOptional: true, isIndexed: true},
                {name: 'thumbs', type: 'string', isOptional: true, isIndexed: true},
                {name: 'count', type: 'string', isOptional: true, isIndexed: true},
                {name: 'selected', type: 'boolean'},
            ]
        })
    ]
})
