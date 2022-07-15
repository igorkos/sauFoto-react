import * as React from "react";
import {photosListView} from "./PhotosCollectionList";
import {ServiceType} from "../../data/DataServiceConfig";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {theme} from "../../constants/themes";
import {View} from "react-native";
import {HeaderBackButton} from "@react-navigation/elements";
import {Log} from "../../hooks/log";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MenuItem} from 'react-native-material-menu';
import {useState} from "react";
import {SMenu, Text} from "../../components/Themed";

const NavigationDrawerLeft = (props) => {
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

const PubSub = require('pubsub-js');

const NavigationDrawerRight = (props) => {
    const [visible, setVisible] = useState(false);
    const hideMenu = () => {setVisible(false);}
    const showMenu = () => setVisible(true);

    const importToGallery = () => {
        hideMenu()
        Log.debug("'Add to Gallery' pressed")
        PubSub.publish(ServiceType.Camera+'Menu', 'importToGallery');
    }
    const importToAlbum = () => {
        hideMenu()
        PubSub.publish(ServiceType.Camera+'Menu', 'importToAlbum');
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

const Stack = createNativeStackNavigator();

export function CameraNavigator({navigation}) {
    return (
        <Stack.Navigator>
            <Stack.Screen  name="Camera" component={CameraScreen} options={{ headerShown: true,
                headerStyle: {backgroundColor: theme.colors.headerBackground,},
                headerTintColor: theme.colors.text,
                headerLeft: () => (
                    <NavigationDrawerLeft navigationProps={navigation}/>
                ),
                headerRight: () => (
                    <NavigationDrawerRight navigationProps={navigation}/>
                ),
            }}/>
        </Stack.Navigator>
    );
}

function CameraScreen({ navigation }) {
    return photosListView(navigation, ServiceType.Camera)
}
