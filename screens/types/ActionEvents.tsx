
export const eventsSubscriber = 'NavigationDrawerEvents'

export enum ActionEvents {
    none = 'none',
    selectAll = 'selectAll',
    importToGallery = 'importToGallery',
    addAlbum = 'addAlbum',
    addImages = 'addImages',
    addToAlbum = 'addToAlbum',
    selectImages = 'selectImages',
    importToAlbum = 'importToAlbum'
}

export interface ActionEventsMenuItem{
    action: ActionEvents,
    title: string | null,
    icon: string | null,
}
export const  ActionEventsMenu = {
    none: {action: ActionEvents.none, title:null, icon:null},
    selectAll: {action: ActionEvents.selectAll, title:'Select all', icon:null},
    importToGallery: {action: ActionEvents.importToGallery, title:'Add to Gallery', icon:null},
    addAlbum: {action: ActionEvents.addAlbum, title:null, icon:'plus'},
    addImages: {action: ActionEvents.addImages, title:null, icon:'plus'},
    addToAlbum: {action: ActionEvents.addToAlbum, title:'Add photos', icon:null},
    selectImages: {action: ActionEvents.selectImages, title:'Select', icon:null},
    importToAlbum: {action: ActionEvents.none, title:'Add to Album', icon:null},
}

export interface ActionEvent{
    event: ActionEvents,
    data?:any
}

export function createAction(event:ActionEvents, data?:any): ActionEvent {
    return {
        event:event,
        data:data
    }
}
