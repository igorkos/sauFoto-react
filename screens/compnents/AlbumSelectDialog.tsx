import * as React from "react";
import {StyleSheet, TextInput} from "react-native";
import {useEffect, useState} from "react";
import {database} from "../../index";
import {Log} from "../../utils/log";
import {Subscription} from "rxjs";
import {
    MaterialDialog,
    PickerItem,
    SinglePickerMaterialDialog
} from "react-native-material-dialog";
import {array} from "prop-types";
import {theme} from "../../styles/themes";
import {SaufotoAlbum} from "../../data/watermelon/SaufotoAlbum";


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
            titleColor={theme.colors.text}
            // @ts-ignore
            backgroundColor={theme.colors.background}
            colorAccent={theme.colors.text}
            title={"Create album"}
            onOk={() => {
                props.onOk(text)
            }}
            onCancel={() => {
                props.onCancel()
            }}>
            <TextInput
                style={styles.inputText}
                onChangeText={(text) => {
                    setText(text)
                }}
                placeholder="New album name"
                placeholderTextColor={theme.colors.tint}
            />
        </MaterialDialog>
    )
}

const styles = StyleSheet.create({
    inputText: {
        fontSize: 16,
        numberOfLines: 1,
        ellipsizeMode: 'tail',
        alignItems: 'center',
        justifyContent: 'center',
        color:theme.colors.text
    },
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
