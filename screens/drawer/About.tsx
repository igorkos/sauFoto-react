import * as React from "react";
import {Image, StyleSheet, TouchableOpacity, Linking, Platform} from 'react-native';

import { View, Text } from '../../styles/Themed';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../styles/themes";
import {NavigationDrawerBack} from "../compnents/DrawerButtons";
import Icon from "react-native-vector-icons/Ionicons";
import Colors from "../../styles/Colors";
import {screenWidth} from "../../styles/Layout";
import {EmailDialog, SMSDialog} from "../compnents/ShareDialog";
import {useMemo, useRef, useState} from "react";
// @ts-ignore
import qs from 'qs';
import BottomSheet from "@gorhom/bottom-sheet";

const Stack = createNativeStackNavigator();
const APP_STORE_LINK_IOS = 'https://akello.com'
const APP_STORE_LINK_ANDROID = 'https://akello.com'
// @ts-ignore
export function AboutNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Screen  name="AboutScreen" component={AboutScreen} options={{ headerShown: true,
                title:'About',
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerBack navigationProps={navigation}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}

function AboutScreen() {
    const [emailVisible, setEmailVisible] = useState<boolean>(false)
    const [smsVisible, setSMSlVisible] = useState<boolean>(false)
    const onActionPress = (index:number) => {
        switch (index) {
            case 0:{
                let link: string
                if(Platform.OS === 'ios') {
                    link = 'itms-apps://apps.apple.com/tr/app/times-tables-lets-learn/id1055437768?l=tr';

                } else {
                    link = "market://details?id=com.akellolcc.saufoto"
                }
                Linking.canOpenURL(link).then(
                    (supported) => {
                        supported && Linking.openURL(link);
                    },
                    (err) => console.log(err)
                );
                break
            }
            case 1: {
                //setEmailVisible(true)
                setSMSlVisible(true)
            }

        }
    }

    const sendEmail = async (to:string | null) => {
        setEmailVisible(false)
        if(to !== null) {
            const email = to.trim()

            let url = `mailto:${email}`;

            // Create email link query
            const query = qs.stringify({
                subject: 'Please look on this app',
                body: Platform.OS === 'ios' ? APP_STORE_LINK_IOS:APP_STORE_LINK_ANDROID,
            });

            if (query.length) {
                url += `?${query}`;
            }

            await Linking.openURL(url);
        }
    }
    const sendSMS = async (phone:string | null) => {
        setSMSlVisible(false)
        if(phone !== null) {
            const operator = Platform.select({ios: '&', android: '?'});
            const to = phone.trim()
            const query = qs.stringify({
                body: ('Look on this great app ' + (Platform.OS === 'ios' ? APP_STORE_LINK_IOS:APP_STORE_LINK_ANDROID)),
            });
            await Linking.openURL(`sms:${to}${operator}${query}`)
        }
    }
    const cancel = () => {

    }
    const snapPoints = useMemo(() => ['25%', '50%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    return (
        <View style={styles.container}>
            <EmailDialog visible={emailVisible} onOk={sendEmail} onCancel={cancel}/>
            <SMSDialog visible={smsVisible} onOk={sendSMS} onCancel={ cancel}/>
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}

                >
                <View style={styles.topContainer}>
                    <Text>Awesome 🎉</Text>
                </View>
            </BottomSheet>
            <View style={styles.topContainer}>
                <Image style={styles.logo} source={require('../../assets/images/ic_launcher_round.png')} />
                <Text style={styles.logoText}>sauFoto</Text>
                <Text >{require('../../package.json').version}</Text>
                <Text >Akello LLC ©</Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => {onActionPress(0)}}><Icon name={'logo-google-playstore'} size={40} color={theme.colors.text} /></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {onActionPress(1)}}><Icon name={'share-social-sharp'} size={40} color={theme.colors.text}/></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {onActionPress(2)}}><Icon name={'star'} size={40} color={theme.colors.text}/></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {onActionPress(3)}}><Icon name={'send-sharp'} size={40} color={theme.colors.text}/></TouchableOpacity>
            </View>
            <View style={styles.useContainer}>
                <Text >React Native</Text>
                <Text >Stacks</Text>
                <Text >Expo</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topContainer: {
        flex: 1/3,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth:1,
        borderRadius: 10,
        borderColor:theme.colors.border,
        elevation:5,
        width:screenWidth
    },
    logo:{
        width: 100,
        height: 100,
    },
    logoText:{
        fontSize: 24,
        color:theme.colors.text,
        fontWeight:'bold',
    },
    actionsContainer: {
        flex: 1/5,
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width:screenWidth,
    },
    useContainer: {
        flex: 8/15,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        width:screenWidth,
        padding: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    button: {
        width: 45,
        height: 45,
    },
});
