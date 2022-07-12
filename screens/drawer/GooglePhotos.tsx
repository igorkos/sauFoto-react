import * as React from "react";
import { Text, View } from '../../components/Themed';
import {useEffect} from "react";
import {Log} from "../../hooks/log";
import {googleAuth} from "../../data/GoogleDataSource";

export default function GooglePhotosScreen({ navigation }) {

    const fetchData = async (root) => {
        return await googleAuth().then( (config) => {
            Log.debug("Google config: '" + config + "'");
        })
    }

    useEffect(() => {
        fetchData(null).catch((err) => {
            Log.error("Loading Google images error:" + err)
        });
    }, []);


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Google</Text>
        </View>
    );
};
