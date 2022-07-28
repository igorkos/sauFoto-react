import {StyleSheet, TouchableOpacity, View} from "react-native";
import {HeaderBackButton} from "@react-navigation/elements";
import {Log} from "../../utils/log";
import * as React from "react";
import {useState} from "react";
import {theme} from "../../styles/themes";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ActionEvents, ActionEventsMenu, createAction, eventsSubscriber} from "../types/ActionEvents";
import {Text} from "../../styles/Themed";
import {Menu, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import Colors from "../../styles/Colors";

const PubSub = require('pubsub-js');

export const NavigationDrawerBack = (props: { navigationProps: { goBack(): void; }; }) => {
    return (
        <View style={{ height: '100%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <HeaderBackButton
                label={'Back'}
                onPress={() => {
                    Log.debug('Header left press')
                    props.navigationProps.goBack()
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
    const [firstSelected, setFirstSelected] = useState(false);
    const TopItem = (props:{index:number, actions:ActionEvents[], marginEnd:number}) => {
        const i = props.index
        const onSelected = () => {
            Log.debug("Select " + props.actions[i] + " pressed")
            if(props.index === 0 ) {
                setFirstSelected(!firstSelected)
            }
            // @ts-ignore
            PubSub.publish(eventsSubscriber, createAction(ActionEventsMenu[props.actions[i]].action, firstSelected));
        }
        if( ActionEventsMenu[props.actions[i]].icon !== null ) {
            return(
                <TouchableOpacity style={{marginEnd: props.marginEnd}} onPress={onSelected}>
                    <Icon name={ActionEventsMenu[props.actions[i]].icon!} color={theme.colors.text} size={25}/>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity style={{...styles.textButtonStyle, marginEnd:props.marginEnd}} onPress={onSelected}>
                    <Text style={styles.caption} >{firstSelected ?ActionEventsMenu[props.actions[i]].selectedTitle:ActionEventsMenu[props.actions[i]].title}</Text>
                </TouchableOpacity>
            )
        }
    }

    const MenuList = () => {
        const onSelected = (i: number) => {
            Log.debug("Menu Select " + props.actions[i] + " pressed")
            // @ts-ignore
            PubSub.publish(eventsSubscriber, createAction(ActionEventsMenu[props.actions[i]].action));
        }

        return (
            <Menu>
                <MenuTrigger>
                    <Icon name={'dots-horizontal'} color={theme.colors.text} size={25}/>
                </MenuTrigger>
                <MenuOptions>
                {
                    props.actions.map((a,i) => {
                        if( i > 0) {
                            return (
                                <MenuOption customStyles={{optionWrapper:styles.menuStyle, optionText:styles.menuText}} key={i}  onSelect={() => { onSelected(i) }}>
                                        <Text style={styles.menuText} >{ActionEventsMenu[props.actions[i]].title}</Text>
                                        <Icon name={ActionEventsMenu[props.actions[i]].icon!} color={theme.colors.text} size={25}/>
                                </MenuOption>
                            )
                        }
                        return null
                    })
                }
                </MenuOptions>
            </Menu>
        )
    }

    const renderBar = () => {
        if(props.actions.length === 1) {
            return (<TopItem index={0} actions={props.actions} marginEnd={0}/>)
        } else if(props.actions.length === 2) {
            return (<><TopItem marginEnd={20}  index={0} actions={props.actions}/><TopItem marginEnd={0} index={1} actions={props.actions}/></>)
        } else {
            return (<><TopItem marginEnd={20} index={0} actions={props.actions}/><MenuList/></>)
        }
    }
    return (
        <View style={{alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row',}}>
            {renderBar()}
        </View>
    )
}

const styles = StyleSheet.create({
    caption: {
        fontSize: 14,
        numberOfLines: 1,
        ellipsizeMode: 'tail',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight:'bold',
    },
    menuText: {
        fontSize: 16,
        margin:5,
        numberOfLines: 1,
        ellipsizeMode: 'tail',
        alignItems: 'center',
        justifyContent: 'center',
        color:theme.colors.text
    },
    textButtonStyle: {
        borderColor:theme.colors.tint,
        borderRadius:15,
        elevation:5,
        backgroundColor: Colors.light.tabBackground,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingStart:15,
        paddingEnd: 15,
        paddingTop:5,
        paddingBottom:5
    },
    menuStyle: {
        borderColor:theme.colors.tint,
        elevation:5,
        borderRadius:5,
        padding:5,
        backgroundColor: Colors.light.tabBackground,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
})
