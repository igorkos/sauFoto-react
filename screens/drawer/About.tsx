import * as React from "react";
import { Platform, StyleSheet, StatusBar } from 'react-native';

import { Text, View } from '../../styles/Themed';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Modal</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

            {/* Use a light status bar on iOS to account for the black space above the modal */}
            <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
});
