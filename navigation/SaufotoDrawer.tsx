import * as React from "react";
import {View} from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItem,
} from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';
import {Caption, Title, Avatar, Drawer} from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AuthContext} from "../styles/context";
import {database} from "../index";

// @ts-ignore
const SaufotoDrawer = (props) => {
    // @ts-ignore
    const {signOut} = React.useContext(AuthContext);
    return (
        <View style={{flex: 1}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{flexDirection: 'row', marginTop: 15}}>
                            <Avatar.Image
                                source={{
                                    uri: 'https://api.adorable.io/avatars/50/abott@adorable.png',
                                }}
                                size={50}
                            />
                            <View style={{marginLeft: 15, flexDirection: 'column'}}>
                                <Title style={styles.title}>John Doe</Title>
                                <Caption style={styles.caption}>@j_doe</Caption>
                            </View>
                        </View>
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            label="Gallery"
                            icon={({color, size}) => (
                                <Icon name="image-multiple-outline" color={color} size={size} />
                            )}
                            onPress={() => props.navigation.navigate('Gallery')}
                        />
                    </Drawer.Section>
                    <Drawer.Section title="Import">
                        <DrawerItem
                            label="Camera"
                            icon={({color, size}) => (
                                <Icon name="camera-outline" color={color} size={size} />
                            )}
                            onPress={() => props.navigation.navigate('Camera')}
                        />
                        <DrawerItem
                            label="Google Photos"
                            icon={({color, size}) => (
                                <Icon name="google" color={color} size={size} />
                            )}
                            onPress={() => props.navigation.navigate('Google')}
                        />
                        <DrawerItem
                            label="Dropbox"
                            icon={({color, size}) => (
                                <Icon name="dropbox" color={color} size={size} />
                            )}
                            onPress={() => props.navigation.navigate('Dropbox')}
                        />
                    </Drawer.Section>
                    <Drawer.Section title="Other">
                        <DrawerItem
                            label="Settings"
                            icon={({color, size}) => (
                                <Icon name="cog-outline" color={color} size={size} />
                            )}
                            onPress={() => props.navigation.navigate('Settings')}
                        />
                        <DrawerItem
                            label="About"
                            icon={({color, size}) => (
                                <Icon name="information-outline" color={color} size={size} />
                            )}
                            onPress={() => props.navigation.navigate('About')}
                        />
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    label="Reset data"
                    icon={({color, size}) => (
                        <Icon name="exit-to-app" color={color} size={size} />
                    )}
                    onPress={async () => {
                        database.write(async () => {
                            await database.unsafeResetDatabase()
                        })
                    }}
                />
                <DrawerItem
                    label="Sign Out"
                    icon={({color, size}) => (
                        <Icon name="exit-to-app" color={color} size={size} />
                    )}
                    onPress={() => {
                        signOut();
                    }}
                />

            </Drawer.Section>
        </View>
    );
};

export default SaufotoDrawer;

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    title: {
        fontSize: 16,
        marginTop: 3,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});
