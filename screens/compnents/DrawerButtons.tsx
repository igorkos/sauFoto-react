import {StyleSheet, TouchableOpacity, View} from "react-native";
import {HeaderBackButton} from "@react-navigation/elements";
import {Log} from "../../utils/log";
import * as React from "react";
import {useState} from "react";
import {SMenu, Text} from "../../styles/Themed";
import {theme} from "../../styles/themes";
import {MenuItem} from "react-native-material-menu";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ActionEvents, ActionEventsMenu, createAction, eventsSubscriber} from "../types/ActionEvents";
import {action} from "@nozbe/watermelondb/decorators";

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

export const HeaderNavigationRight =  ( props: {actions: ActionEvents[]}) => {
    const event ='NavigationDrawerEvents'
    const [visible, setVisible] = useState(false);
    const hideMenu = () => {setVisible(false);}
    const showMenu = () => setVisible(true);

    const FirstItem = () => {
        const onSelected = () => {
            Log.debug("Select " + action + " pressed")
            PubSub.publish(eventsSubscriber, createAction(ActionEventsMenu[props.actions[0]].action));
        }
        if( ActionEventsMenu[props.actions[0]].title === null ) {
            return(
                <TouchableOpacity style={{marginEnd:10}} onPress={onSelected}>
                    <Icon name={ActionEventsMenu[props.actions[0]].icon!} color={theme.colors.text} size={25}/>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity style={{marginEnd:10}} onPress={onSelected}>
                    <Text style={{...styles.caption, fontWeight:'bold'}} >{ActionEventsMenu[props.actions[0]].title}</Text>
                </TouchableOpacity>
            )
        }
    }

    const MenuList = () => {
        const onSelected = (i: number) => {
            Log.debug("Select " + props.actions[i] + " pressed")
            PubSub.publish(eventsSubscriber, createAction(ActionEventsMenu[props.actions[i]].action));
        }
        if(props.actions.length > 1) {
            return (
                <SMenu visible={visible}
                   anchor={<Icon name={'dots-horizontal'} color={theme.colors.text} size={25} onPress={showMenu}/>}
                   onRequestClose={hideMenu}>
                    {
                        props.actions.map((a,i) => {
                            if( i > 0) {
                                return (
                                    <MenuItem key={i} disabledTextColor={theme.colors.text} onPress={() => { onSelected(i) }}>
                                        <Text>{ActionEventsMenu[props.actions[i]].title}</Text>
                                    </MenuItem>)
                            }
                            return null
                        })
                    }
                </SMenu>
            )
        }
        return (null)
    }

    return (
        <View style={{ height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row',}}>
            <FirstItem/>
            <MenuList/>
        </View>
    );
}
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
