import * as React from "react";
import {
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity, TextInput
} from "react-native";
import {View} from "../../styles/Themed";
import {useEffect, useState} from "react";
import {SaufotoAlbum} from "../../data/watermelon/SaufotoImage";
import {database} from "../../index";
import {Log} from "../../utils/log";
import {Subscription} from "rxjs";
import {
    MaterialDialog,
    PickerItem,
    SinglePickerMaterialDialog
} from "react-native-material-dialog";
import {array} from "prop-types";


interface AlbumItem extends PickerItem{
    album: SaufotoAlbum
}
export const AlbumSelectDialog = (visible:boolean, onOk:()=> void, onCancel:() => void) => {
    const [objects, setObjects] = useState<AlbumItem[]>([])
    const [_, setSubscription] = useState<Subscription | null>(null)

    useEffect(() => {
        setTimeout( async () => {
            const subscription = database.get<SaufotoAlbum>('SaufotoAlbum').query().observe().subscribe({
                next: (value) => {
                    Log.debug("AlbumSelectDialog: Table update albums count: " + value.length);
                    const pickerItems = Array.apply(null, Array(value.length)).map((v, i) => {
                        return {
                            album:value[i],
                            label:value[i].title === undefined ? "No name":value[i].title,
                            value:value[i].id
                        }
                    }) as AlbumItem[]
                    setObjects(pickerItems);
                }
            })
            setSubscription(subscription)
        })
    },[])


    return (
        <SinglePickerMaterialDialog
            scrolled
            visible={visible}
            title={"Add to album"}
            items={objects}
            selectedItem={objects[0]}
            onOk={() => {
                onOk()
            }}
            onCancel={() => {
                onCancel()
            }}/>
        )
}

export const NewAlbumDialog = ( props:{onOk:(name:string|null)=> void, onCancel:() => void}) => {
    const [text, setText] = useState<string | null>(null)
    return (
        <MaterialDialog
            visible={true}
            title={"Create album"}
            onOk={() => {
                props.onOk(text)
            }}
            onCancel={() => {
                props.onCancel()
            }}>
            <TextInput
                onChangeText={(text) => {
                    setText(text)
                }}
                placeholder="New album name"
            />
        </MaterialDialog>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        paddingTop: 8
    },
    row: {
        height: 48,
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    },
});
