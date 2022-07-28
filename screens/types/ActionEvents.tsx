
export const eventsSubscriber = 'NavigationDrawerEvents'

export enum ActionEvents {
    none = 'none',
    selectAll = 'selectAll',
    importToGallery = 'importToGallery',
    addAlbum = 'addAlbum',
    addImages = 'addImages',
    addToAlbum = 'addToAlbum',
    selectImages = 'selectImages',
    importToAlbum = 'importToAlbum',
    delete = 'delete'
}

export interface ActionEventsMenuItem{
    action: ActionEvents,
    title: string | null,
    icon: string | null,
    selectedTitle:string | null,
}
export const  ActionEventsMenu = {
    none: {action: ActionEvents.none, title:null, selectedTitle: null, icon:null},
    selectAll: {action: ActionEvents.selectAll, title:'Select all', selectedTitle:'Unselect all', icon:null},
    importToGallery: {action: ActionEvents.importToGallery, title:'Add to Gallery', selectedTitle: null, icon:'import'},
    addAlbum: {action: ActionEvents.addAlbum, title:null,selectedTitle: null, icon:'plus'},
    addImages: {action: ActionEvents.addImages, title:'Add photos',selectedTitle: null, icon:'plus'},
    addToAlbum: {action: ActionEvents.addToAlbum, title:'Add photos',selectedTitle: null, icon:'plus'},
    selectImages: {action: ActionEvents.selectImages, title:'Select',selectedTitle: 'Cancel', icon:null},
    importToAlbum: {action: ActionEvents.importToAlbum, title:'Add to Album',selectedTitle: null, icon:'import'},
    delete: {action: ActionEvents.delete, title:null, selectedTitle: null, icon:'trash-can-outline'},
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
