import {Log} from "../../hooks/log";
import {FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, TouchableOpacity} from "react-native";
import {getPlaceFolder} from "../../constants/Images";
import {View} from "../../components/Themed";
import {Caption} from "react-native-paper";
import * as React from "react";
import {useEffect, useState} from "react";
import {getThumbsData} from "../../data/DropboxDataSource";
import {theme} from "../../constants/themes";
import {Item} from "linked-list";
import * as Progress from 'react-native-progress';

export class Folder extends Item {
    readonly value?: string;

    constructor(value) {
        super()
        this.value = value
    }

    toString() {
        return this.value
    }
}

export const photosListView = (dataSource, onItemSelected, getThumbUri) => {
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
                                    onItemSelected(item);
                                }}>
                                <ImageSource item={item} getThumbUri={getThumbUri}/>
                            </TouchableOpacity>
                        </View>
                    )}
                    numColumns={3}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </SafeAreaView>
    );
}


const ImageSource = (item) => {
    const media = item.item
    if (media.type !== 'album') {
        const uri = item.getThumbUri(media.originalUri)
        Log.debug("Render image  '" + media.originalUri + "'")
        if( uri !== null) {
            return (<Image
                style={styles.imageStyle}
                source={{uri}}
            />)
        } else {
            Log.debug("Render Album  '" + media.originalUri + "'")
            return (
                <ImageBackground
                    style={styles.imageStyle}
                    source={getPlaceFolder(media.placeHolderImage)}>
                    <Progress.Circle size={30} indeterminate={true}/>
                </ImageBackground>
            )
        }
    } else {
        return (
            <View style={{alignItems: 'center', flex: 1,}}>
                <Image
                    style={styles.imageStyle}
                    source={getPlaceFolder(media.placeHolderImage)}
                />
                <Caption style={styles.caption}>{media.title}</Caption>
            </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    caption: {
        justifyContent: 'center',
        fontSize: 14,
        lineHeight: 14,
    },
    imageContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
    },
    imageStyle: {
        height: 120,
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
