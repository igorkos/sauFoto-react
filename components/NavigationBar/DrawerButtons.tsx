import {View} from "react-native";
import {HeaderBackButton} from "@react-navigation/elements";
import {Log} from "../../hooks/log";
import * as React from "react";
import {useState} from "react";
import {SMenu, Text} from "../Themed";
import {theme} from "../../constants/themes";
import {MenuItem} from "react-native-material-menu";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PubSub = require('pubsub-js');

export const NavigationDrawerBack = (props) => {
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


export const NavigationDrawerRightImportImages = (props) => {
    const [visible, setVisible] = useState(false);
    const hideMenu = () => {setVisible(false);}
    const showMenu = () => setVisible(true);
    const event = props.type + 'Menu'
    const importToGallery = () => {
        hideMenu()
        Log.debug("'Add to Gallery' pressed")
        PubSub.publish(event, 'importToGallery');
    }
    const importToAlbum = () => {
        hideMenu()
        PubSub.publish(event, 'importToAlbum');
    }
    return (
        <View  style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <SMenu visible={visible}
                   anchor={ <Icon name={'menu'} color={theme.colors.text} size={25} onPress={showMenu}/>  }
                   onRequestClose={hideMenu}>
                <MenuItem disabledTextColor={theme.colors.text} onPress={importToGallery}><Text>Add to Gallery</Text> </MenuItem>
                <MenuItem disabledTextColor={theme.colors.text} onPress={importToAlbum}><Text>Add to Album</Text></MenuItem>
            </SMenu>
        </View>
    );
};
