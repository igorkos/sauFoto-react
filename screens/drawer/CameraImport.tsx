import * as React from "react";
import {Platform, StyleSheet, StatusBar, SafeAreaView, FlatList, TouchableOpacity} from 'react-native';
import { Text, View } from '../../components/Themed';
import FastImage from "react-native-fast-image";
import {theme} from "../../constants/themes";
import {useEffect, useState} from "react";
import * as MediaLibrary from "expo-media-library";
import * as CameraRoll from "@react-native-community/cameraroll";
import {CameraRollImages} from "../../data/CameraRollDataSource";
import {Log} from "../../hooks/log";

export default function CameraScreen({ navigation }) {
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await MediaLibrary.requestPermissionsAsync()
            const photos = await CameraRollImages()
            Log.debug("Loading Camera Roll images:" + photos)
            setDataSource(photos)
        }
        fetchData().catch((err) => {
            Log.error("Loading Camera Roll images error:" + err)
        });
    }, []);

    const showModalFunction = (id) => {
        //handler to handle the click on image of Grid
        //and close button on modal
        navigation.navigate('ImageCarousel', {selected: id, collection:dataSource })
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <FlatList
                    data={dataSource}
                    renderItem={({item}) => (
                        <View style={styles.imageContainerStyle}>
                            <TouchableOpacity
                                key={item.id}
                                style={{flex: 1}}
                                onPress={() => {
                                    showModalFunction(item.id);
                                }}>
                                <FastImage
                                    style={styles.imageStyle}
                                    source={{
                                        uri: item.image,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    //Setting the number of column
                    numColumns={3}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    imageContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
    },
    imageStyle: {
        height: 120,
        width: 120,
    },
});
