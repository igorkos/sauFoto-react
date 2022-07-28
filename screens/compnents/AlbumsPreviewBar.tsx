import {Text, View} from "../../styles/Themed";
import {StyleSheet, Switch, TouchableOpacity} from "react-native";
import {theme} from "../../styles/themes";
import * as React from "react";

export const AlbumsPreviewBar = (props: { state: boolean | undefined; albums: any; isImport: any; callback: (arg0: boolean) => void; }) => {
    const bFont =  props.state ? 'normal':'bold'
    const sFont =  props.state ? 'bold':'normal'
    return (props.albums && props.isImport) ? (
        <View style={styles.previewStyle}>
            <TouchableOpacity style={{...styles.caption, height:'100%', marginEnd:10,}} onPress={() =>{props.callback(false)}}>
                <Text style={{...styles.caption, fontWeight:bFont}} >Browse</Text>
            </TouchableOpacity>
            <Switch
                style={styles.switchStyle}
                trackColor={{ false: theme.colors.tint, true: theme.colors.tint }}
                thumbColor={theme.colors.text}
                ios_backgroundColor={theme.colors.background}
                value={props.state}
            />
            <TouchableOpacity style={{...styles.caption, height:'100%',  marginStart:10, marginEnd:10,}} onPress={() =>{props.callback(true)}}>
                <Text style={{...styles.caption, fontWeight:sFont}} >Select</Text>
            </TouchableOpacity>
        </View>
    ):(<View style={{height:0}}/>)
}

const styles = StyleSheet.create({
    caption: {
        flexDirection:'row',
        fontSize: 14,
        lineHeight: 14,
        numberOfLines:1,
        ellipsizeMode:'tail',
        alignItems: 'center',
        justifyContent: 'center'
    },
    switchStyle: {
        flexDirection:'row',
        height:'100%',
    },
    previewStyle: {
        flexDirection:'row',
        height: 40,
        width: '100%',
        backgroundColor: theme.colors.background,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
});
