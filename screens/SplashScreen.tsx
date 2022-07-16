import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity, Platform, PermissionsAndroid,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Colors from "../constants/Colors";
import LinearGradient from "react-native-linear-gradient";
import {theme} from "../constants/themes";
import * as Animatable from 'react-native-animatable';
import {AuthContext} from "../components/context";
import users from "../stacks/users";
import { Camera} from 'expo-camera';
import {Log} from "../hooks/log";
import {useEffect} from "react";
import {screenWidth} from "../constants/Layout";

// @ts-ignore
export function SplashScreen({navigation}){
  // @ts-ignore
  const {signIn} = React.useContext(AuthContext);

  useEffect(() => {
    setTimeout(async () => {
      const newCameraPermission = await Camera.requestCameraPermissionsAsync()
      Log.debug("Permissions camera:" + newCameraPermission)
      if(Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (!hasPermission) {
          const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
          Log.debug("Permissions write storage:" + status)
        }
      }
    }, 1000);
  });

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/images/bright_rainbow_swirl_background.png')} style={{flex: 1}}>
        <View style={{flex:3, justifyContent: 'center', alignItems: 'center',}}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' ,  alignItems: 'center',  marginRight:10}}>
            <Text style={styles.title}>sau</Text>
            <Animatable.Text style={styles.title1}animation="pulse" easing="ease-in-out-circ" iterationCount="infinite">f</Animatable.Text>
            <Text style={styles.title}>oto</Text>
          </View>
        </View>
        <View style={{flex: 1, justifyContent: 'flex-start', alignItems: 'center',}}>
          <FastImage
              source={require('../assets/images/stock_vector_camera_photo_lens.png')}
              style={styles.logo}
              resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <View style={{flex: 4, justifyContent: 'flex-end', alignItems: 'center',}}>
          <TouchableOpacity style={styles.linearGradient} onPressOut={() => { signIn(users[1])}}>
            <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']}  style={styles.linearGradient}>
              <Text style={styles.text}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00ffffff',
  },
  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 50,
    borderRadius: 5,
    width: 250,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.5,
  },
  title: {
    color: Colors.colors.a100,
    fontSize: 45,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  title1: {
    color: Colors.colors.a100,
    fontSize: 65,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  text: {
    color: theme.colors.textDark,
  },
});
