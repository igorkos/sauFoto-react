import {ActionEvents} from "../types/ActionEvents";
import {Text, View} from "../../styles/Themed";
import {StyleSheet, TouchableOpacity} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {theme} from "../../styles/themes";
import Colors from "../../styles/Colors";
import * as React from "react";

export const SelectionBar = (props: { isVisible: boolean, callback: (action: ActionEvents) => void; }) => {
    return props.isVisible ? (
        <View style={styles.selectBarStyle}>
            <TouchableOpacity style={{...styles.caption, height:'100%', marginStart:10,}} onPress={() =>{}}>
                <Icon name={'dots-horizontal'} color={theme.colors.text} size={25}/>
            </TouchableOpacity>
            <Text style={styles.title} >Select items</Text>
            <TouchableOpacity style={{...styles.caption, height:'100%', marginEnd:10,}} onPress={() =>{props.callback(ActionEvents.delete)}}>
                <Icon name={'trash-can-outline'} color={theme.colors.text} size={25}/>
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
    title: {
        flexDirection:'row',
        fontSize: 18,
        numberOfLines:1,
        ellipsizeMode:'tail',
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectBarStyle: {
        flexDirection:'row',
        height: 46,
        width: '100%',
        borderColor:theme.colors.tint,
        elevation:5,
        backgroundColor: Colors.light.tabBackground,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
