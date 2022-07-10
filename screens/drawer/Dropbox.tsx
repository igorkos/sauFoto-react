import * as React from "react";
import {StyleSheet,SafeAreaView, FlatList, TouchableOpacity} from 'react-native';

import { Text, View } from '../../components/Themed';
import {useEffect, useState} from "react";
import {Log} from "../../hooks/log";
import FastImage from "react-native-fast-image";
import {theme} from "../../constants/themes";
import {DropboxImages} from "../../data/DropboxDataSource";

export default function DropboxScreen({ navigation }) {
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const photos = await DropboxImages()
            Log.debug("Loading Dropbox images:" + photos)
            setDataSource(photos)
        }
        fetchData().catch((err) => {
            Log.error("Loading Dropbox images error:" + err)
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
