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
export const EmailDialog = ( props:{visible:boolean, onOk:(email:string| null)=> void, onCancel:() => void}) => {
    const [text, setText] = useState<string | null>(null)
    return (
        <MaterialDialog
            visible={props.visible}
            titleColor={theme.colors.text}
            okLabel={'SHARE'}
            // @ts-ignore
            backgroundColor={theme.colors.background}
            colorAccent={theme.colors.text}
            title={"Share sauFoto"}
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
                placeholder="Email"
                placeholderTextColor={theme.colors.tint}
            />
        </MaterialDialog>
        )
}

export const SMSDialog = ( props:{visible:boolean, onOk:(phone:string|null)=> void, onCancel:() => void}) => {
    const [phone, setPhone] = useState<string | null>(null)
    return (
        <MaterialDialog
            visible={props.visible}
            titleColor={theme.colors.text}
            okLabel={'SHARE'}
            // @ts-ignore
            backgroundColor={theme.colors.background}
            colorAccent={theme.colors.text}
            title={"Share sauFoto"}
            onOk={() => {
                props.onOk(phone)
            }}
            onCancel={() => {
                props.onCancel()
            }}>
            <TextInput
                style={styles.inputText}
                onChangeText={(text) => {
                    setPhone(text)
                }}
                placeholder="Phone"
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
