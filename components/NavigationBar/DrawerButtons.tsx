import {StyleSheet, TouchableOpacity, View} from "react-native";
import {HeaderBackButton} from "@react-navigation/elements";
import {Log} from "../../hooks/log";
import * as React from "react";
import {useState} from "react";
import {SMenu, Text} from "../Themed";
import {theme} from "../../constants/themes";
import {MenuItem} from "react-native-material-menu";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PubSub = require('pubsub-js');

export const NavigationDrawerBack = (props: { navigationProps: { navigate: (arg0: string) => void; }; }) => {
    return (
        <View style={{ height: '100%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <HeaderBackButton
                label={'Back'}
                onPress={() => {
                    Log.debug('Header left press')
                    props.navigationProps.navigate('Home')
                }}
            />
        </View>
    );
};


export const NavigationDrawerRightImportImages = (props: { type: string; }) => {
    const [visible, setVisible] = useState(false);
    const hideMenu = () => {setVisible(false);}
    const showMenu = () => setVisible(true);
    const event ='NavigationDrawerEvents'
    const importToGallery = () => {
        hideMenu()
        Log.debug("'Add to Gallery' pressed")
        PubSub.publish(event, 'importToGallery');
    }
    const importToAlbum = () => {
        hideMenu()
        Log.debug("'Add to Album' pressed")
        PubSub.publish(event, 'importToAlbum');
    }
    const selectAll = () => {
        Log.debug("'Select All' pressed")
        PubSub.publish(event, 'selectAll');
    }
    return (
        <View  style={{ height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row',}}>
            <TouchableOpacity
                style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {selectAll()}}>
                <Text style={{...styles.caption, fontWeight:'bold'}} >Select All</Text>
            </TouchableOpacity>
            <SMenu visible={visible}
                   anchor={ <Icon name={'menu'} color={theme.colors.text} size={25} onPress={showMenu}/>  }
                   onRequestClose={hideMenu}>
                <MenuItem disabledTextColor={theme.colors.text} onPress={importToGallery}><Text>Add to Gallery</Text> </MenuItem>
                <MenuItem disabledTextColor={theme.colors.text} onPress={importToAlbum}><Text>Add to Album</Text></MenuItem>
            </SMenu>
        </View>
    );
};

export const NavigationDrawerLeft = (props: { navigationProps: { toggleDrawer: () => void; }; }) => {
    const toggleDrawer = () => {
        //Props to open/close the drawer
        props.navigationProps.toggleDrawer();
    };

    return (
        <View style={{ flexDirection: 'row', marginEnd:10}}>
            <TouchableOpacity onPress={toggleDrawer}>
                <Icon name={'menu'} color={theme.colors.text} size={25}/>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    caption: {
        flexDirection: 'row',
        fontSize: 14,
        lineHeight: 14,
        numberOfLines: 1,
        ellipsizeMode: 'tail',
        alignItems: 'center',
        justifyContent: 'center'
    },
    menu: {
        flexDirection: 'row',
    },
})
