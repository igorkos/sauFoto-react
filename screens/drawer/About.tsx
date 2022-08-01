import * as React from "react";
import {Image, StyleSheet, TouchableOpacity,} from 'react-native';

import { View, Text } from '../../styles/Themed';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../styles/themes";
import {NavigationDrawerBack} from "../compnents/DrawerButtons";
import Icon from "react-native-vector-icons/Ionicons";
import FIcon from "react-native-vector-icons/FontAwesome5";
import {screenWidth} from "../../styles/Layout";
import {EmailDialog, SMSDialog} from "../compnents/ShareDialog";
import {useCallback, useMemo, useRef, useState} from "react";
import InAppReview from 'react-native-in-app-review'

import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet";
import {openAppStore, sendEmail, shareEmail, shareSMS} from "../../utils/ShareTools";
import {Log} from "../../utils/log";

const Stack = createNativeStackNavigator();

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
    const snapPoints = useMemo(() => ['15%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleSheetChanges = useCallback((index: number) => {
        Log.debug('handleSheetChanges', index);
    }, []);

    const onActionPress = (index:number) => {
        switch (index) {
            case 0:{
                openAppStore()
                break
            }
            case 1: {
                bottomSheetRef?.current?.expand()
                break
            }
            case 2: {
                InAppReview.RequestInAppReview()
                    .then((hasFlowFinishedSuccessfully) => {
                        Log.debug('InAppReview finished', hasFlowFinishedSuccessfully);

                        if (hasFlowFinishedSuccessfully) {
                            // do something for ios
                            // do something for android
                        }
                    })
                    .catch((error) => {
                        Log.error(error);
                    });
                break
            }
            case 3: {
                sendEmail().then(_r => {})
                break
            }
            case 4:{
                bottomSheetRef?.current?.close()
                setEmailVisible(true)
                break
            }
            case 5: {
                bottomSheetRef?.current?.close()
                setSMSlVisible(true)
                break
            }
        }
    }

    const onOk = (value:string | null) => {
        if(smsVisible) {
            shareSMS(value).then(_r => {})
        } else {
            shareEmail(value).then(_r => {})
        }
    }

    const cancel = () => {
        setEmailVisible(false)
        setSMSlVisible(false)
    }

    return (
        <><View style={styles.container}>
            <EmailDialog visible={emailVisible} onOk={onOk} onCancel={cancel}/>
            <SMSDialog visible={smsVisible} onOk={onOk} onCancel={cancel}/>
            <View style={styles.topContainer}>
                <Image style={styles.logo} source={require('../../assets/images/ic_launcher_round.png')}/>
                <Text style={styles.logoText}>sauFoto</Text>
                <Text>{require('../../package.json').version}</Text>
                <Text>Akello LLC ©</Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => {
                    onActionPress(0);
                }}><Icon name={'logo-google-playstore'} size={40} color={theme.colors.text}/></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {
                    onActionPress(1);
                }}><Icon name={'share-social-sharp'} size={40} color={theme.colors.text}/></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {
                    onActionPress(2);
                }}><Icon name={'star'} size={40} color={theme.colors.text}/></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {
                    onActionPress(3);
                }}><Icon name={'send-sharp'} size={40} color={theme.colors.text}/></TouchableOpacity>
            </View>
            <View style={styles.useContainer}>
                <Text>React Native</Text>
                <Text>Stacks</Text>
                <Text>Expo</Text>
            </View>
        </View>
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onChange={handleSheetChanges}>
            <BottomSheetView style={{flex: 1}}>
                <View style={styles.bottomSheet}>
                    <TouchableOpacity onPress={() => {onActionPress(4)}}>
                        <Icon name={'ios-mail-open-outline'} size={60} color={theme.colors.text}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {onActionPress(5)}}>
                        <FIcon name={'sms'} size={60} color={theme.colors.text}/>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>
        </BottomSheet>
       </>
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
    bottomSheet:{
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width:screenWidth,
        backgroundColor:'white'
    }
});
