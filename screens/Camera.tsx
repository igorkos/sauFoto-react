import * as React from "react";
import {useEffect, useState} from "react";
import {Image, StatusBar, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {AutoFocus, Camera, CameraType, FlashMode} from 'expo-camera';
import {View} from "../styles/Themed";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {theme} from "../styles/themes";
import Colors from "../styles/Colors";
import {getPlaceholder} from "../styles/Images";
import FastImage from "react-native-fast-image";
import {screenWidth} from "../styles/Layout";
import {Log} from "../utils/log";
import {addImage} from "../data/watermelon/DataSourceUtils";
import {CameraMountError} from "expo-camera/build/Camera.types";

enum CameraMode{
    Portrait,
    Camera,
    Video
}

enum FlashIcons {
    on = 'flash',
    off = 'flash-off',
    auto = 'flash-auto',
    torch = 'flashlight'
}

function getFlashIcon (mode: FlashMode): string {
    switch (mode) {
        case FlashMode.auto: return FlashIcons.auto
        case FlashMode.off: return FlashIcons.off
        case FlashMode.on: return FlashIcons.on
        case FlashMode.torch: return FlashIcons.torch
    }
}
enum FocusIcons {
    on = 'eye-outline',
    off = 'eye-off-outline',
    singleShot = 'function'
}

function getFocusIcon (mode: AutoFocus): string {
    switch (mode) {
        case AutoFocus.off: return FocusIcons.off
        case AutoFocus.on: return FocusIcons.on
        default: return FocusIcons.singleShot
    }
}
// @ts-ignore
export default function CameraScreen({navigation}) {
    const [hasPermission, setHasPermission] = useState(false);
    const [type, setType] = useState(CameraType.back);

    const [ratios, setRatios] = useState<string[]>([]);
    const [ratio, setRatio] = useState<string>('4:3');
    const [flash, setFlash] = useState<FlashMode>(FlashMode.auto);
    const [focus, setFocus] = useState<AutoFocus>(AutoFocus.on);
    const [focusDepth, setFocusDepth] = useState<number>(0);
    const [preview, setPreview] = useState<string|null>(null);
    const [recording, setRecording] = useState<boolean>(false);

    const [cameraMode, setCameraMode] = useState<number>(1);

    let cameraRef: Camera | null = null

    const availablePictureSizes = async () => {
        const sizes = await cameraRef?.getSupportedRatiosAsync()
        Log.debug("Camera -> Available sizes: " + sizes)
        setRatios(sizes!)
    }

    const onTopBar = async (id: number) => {
        switch (id) {
            case 0: {
                Log.debug("Camera -> Flash mode press" )
                let next: FlashMode
                switch (flash) {
                    case FlashMode.auto: { next = FlashMode.on; break;}
                    case FlashMode.on: {next = FlashMode.off; break;}
                    case FlashMode.off: {next = FlashMode.torch; break;}
                    case FlashMode.torch: {next = FlashMode.auto; break;}
                }
                setFlash(next)
                break
            }
            case 1: {
                Log.debug("Camera -> Ratio mode press" )
                const index = ratios.indexOf(ratio)
                if (index === ratios.length - 1) {
                    setRatio(ratios[0])
                } else {
                    setRatio(ratios[index+1])
                }
                break
            }
            case 2: {
                Log.debug("Camera -> Focus mode press" )
                switch (focus) {
                    case AutoFocus.on: {setFocus(AutoFocus.off); break;}
                    case AutoFocus.off: {setFocus(AutoFocus.on); break;}
                }
            }
        }
    }

    const onBottomBar = async (id: number, value:number) => {
        switch (id) {
            case 0: {
                //Picture mode
                switch (value) {
                    case 0: {
                        //Portrait
                        setCameraMode(0)
                        setFocus(AutoFocus.singleShot)
                        setFocusDepth(0.8)
                        break
                    }
                    case 1: {
                        //Camera
                        setCameraMode(1)
                        setFocus(AutoFocus.on)
                        setFocusDepth(0)
                        break
                    }
                    case 2: {
                        //Video
                        setFocus(AutoFocus.on)
                        setFocusDepth(0)
                        setCameraMode(2)
                        break
                    }
                }

                break
            }
            case 1: {
                //Back to preview
                navigation.navigate('Home', {screen: 'GalleryScreen'})
                break
            }
            case 2:{
                //shooter
                if(cameraMode === CameraMode.Video) {
                    if(recording) {
                        cameraRef?.stopRecording()
                    } else {
                        setRecording(true)
                        cameraRef?.recordAsync().then((value) => {
                            setRecording(false)
                            Log.debug("Camera -> get video")
                            addImage(value.uri).then((entry) => {
                                setPreview(entry.smallThumb)
                            })
                            cameraRef?.resumePreview()
                        }).catch((err) => {
                            Log.error("Camera -> get picture error:" + JSON.stringify(err))
                        })
                    }
                } else {
                    cameraRef?.takePictureAsync().then((value) => {
                        Log.debug("Camera -> get picture" )
                        addImage(value.uri).then((entry) => {
                            setPreview(entry.smallThumb)
                        })
                        cameraRef?.resumePreview()
                    }).catch((err) =>{
                        Log.error("Camera -> get picture error:" + JSON.stringify(err) )
                    })
                }
                break
            }
            case 3:{
                //camera switch
                if( type === CameraType.front) {
                    setType(CameraType.back)
                } else {
                    setType(CameraType.front)
                }
                break
            }
        }
    }

    const onMountError = (event: CameraMountError) => {
        Log.error("Camera -> Mount error: " + JSON.stringify(event))
    }

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if( status === 'granted') {
                const { status } = await Camera.requestMicrophonePermissionsAsync()
                setHasPermission(status === 'granted');
            }
        })();
    }, []);

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }
    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <CameraTopBar isVisible={true} flash={flash} focus={focus} ratio={ratio} onPress={onTopBar}/>
            <Camera
                ref={ref => { cameraRef = ref }}
                style={styles.camera}
                type={type}
                flashMode={flash}
                autoFocus={focus === AutoFocus.singleShot ? AutoFocus.off:focus}
                ratio={ratio}
                useCamera2Api={true}
                focusDepth={focusDepth}
                onCameraReady={availablePictureSizes}
                onMountError={onMountError}
              >
            </Camera>
            <CameraBottomBar isVisible={true} selectedMode={cameraMode} preview={preview} recording={recording} onPress={onBottomBar}/>
        </View>
    )
}
/*
  flashMode={flash}
                autoFocus={focus}
                ratio={ratio}
 */
export const CameraBottomBar = (props: { isVisible: boolean, selectedMode:number, preview:string|null, recording:boolean, onPress:(id:number, value:number) => void}) => {
    const source = props.preview === null ?getPlaceholder('image_placeholder.png'):{uri:props.preview}
    return props.isVisible ? (
        <View style={styles.shuttingControlsContainer}>
            <View style={styles.cameraModesContainer}>
                <TouchableOpacity style={props.selectedMode === 0 ? styles.textButtonSelect:styles.textButton} onPress={() => {props.onPress(0, 0)}}><Text style={props.selectedMode === 0 ? styles.textSelect:styles.text}>Portrait</Text></TouchableOpacity>
                <TouchableOpacity style={props.selectedMode === 1 ? styles.textButtonSelect:styles.textButton} onPress={() => {props.onPress(0, 1)}}><Text style={props.selectedMode === 1 ? styles.textSelect:styles.text}>Photo</Text></TouchableOpacity>
                <TouchableOpacity style={props.selectedMode === 2 ? styles.textButtonSelect:styles.textButton} onPress={() => {props.onPress(0, 2)}}><Text style={props.selectedMode === 2 ? styles.textSelect:styles.text}>Video</Text></TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.previewImage} onPress={() => {props.onPress(1, 0)}}>
                    <FastImage
                        style={styles.previewImage}
                        source={source}/>
                </TouchableOpacity>
                <View style={styles.shutterContainer}>
                    <View style={styles.shutterButtonIn}>
                        <TouchableOpacity
                            style={props.recording ? styles.shutterButtonRecord:styles.shutterButton}
                            onPress={() => {props.onPress(2, 0)}}/>
                    </View>
                </View>
                <TouchableOpacity style={styles.previewImage} onPress={() => {props.onPress(3, 0)}}>
                    <Image style={styles.flipButton} source={getPlaceholder('sync_white.png')}/>
                </TouchableOpacity>
            </View>
        </View>
    ):null
}

export const CameraTopBar = (props: { isVisible: boolean, flash: FlashMode, focus:AutoFocus, ratio:string, onPress:(id:number) => void}) => {
    return props.isVisible ? (
        <View style={styles.topControlsContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={() => {props.onPress(0)}}><Icon name={getFlashIcon(props.flash)} size={20} color={Colors.colors.c10} /></TouchableOpacity>
            <TouchableOpacity style={styles.textTopButton} onPress={() => {props.onPress(1)}}><Text style={styles.text}>{props.ratio}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={() => {props.onPress(2)}}><Icon name={getFocusIcon(props.focus)} size={20} color={Colors.colors.c10}/></TouchableOpacity>
        </View>
    ):null
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    topControlsContainer:{
        flexDirection:'row',
        backgroundColor: Colors.colors.black,
        justifyContent: 'space-between',
        alignItems: 'center',
        width:screenWidth,
        height:40,
        paddingStart:15,
        paddingEnd:15,
    },
    shuttingControlsContainer: {
        backgroundColor: Colors.colors.black,
        justifyContent: 'space-between',
        alignItems: 'center',
        width:screenWidth,
        height:120,
        paddingBottom:20
    },
    buttonContainer: {
        flex: 1,
        flexDirection:'row',
        backgroundColor: Colors.colors.black,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingStart:20,
        paddingEnd:20,
        width:screenWidth,
        height:70
    },
    cameraModesContainer: {
        flex: 1,
        flexDirection:'row',
        backgroundColor: Colors.colors.black,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingStart:20,
        paddingEnd:20,
        width:screenWidth,
        height:30
    },
    shutterContainer:{
        width: 65,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 65,
        backgroundColor: theme.colors.background,
    },
    shutterButtonIn:{
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
        backgroundColor: Colors.colors.black,
    },
    shutterButton:{
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 55,
        backgroundColor: theme.colors.background,
    },
    shutterButtonRecord:{
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 55,
        backgroundColor: Colors.colors.c800,
    },
    flipButton: {
        width: 25,
        height: 25,
    },
    textTopButton: {
        width: 50,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    button:{
        height: 24,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: theme.colors.background,
    },
    textButton:{
        height: 24,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    textButtonSelect:{
        height: 20,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: theme.colors.background,
    },
    textSelect: {
        fontSize: 12,
        color: Colors.colors.black
    },
    topIcon:{
        height: 35,
        width: 35,
        color: Colors.colors.c10
    },
    text: {
        fontSize: 12,
        color: Colors.colors.c10
    },
});
