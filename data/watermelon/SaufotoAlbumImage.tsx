import {Model} from "@nozbe/watermelondb";
import {Tables} from "./shema";
import {immutableRelation} from "@nozbe/watermelondb/decorators";

// @ts-ignore
export class SaufotoAlbumImage extends Model {
    static table = Tables.AlbumImages
    // @ts-ignore
    static associations = {
        image: {type: 'belongs_to', foreignKey: 'image_id'},
        album: {type: 'belongs_to', foreignKey: 'album_id'},
    }

    @immutableRelation(Tables.Image, 'image_id') image!: any
    @immutableRelation(Tables.Album, 'album_id') album!: any
}
