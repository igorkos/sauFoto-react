import * as React from 'react';
import {screenHeight, screenWidth, View} from '../components/Themed';
import {
    Image,
    Dimensions
} from 'react-native';
import {useState, useEffect} from 'react';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';
import {theme} from "../constants/themes";

export default function ImageView({navigation, route}) {
    const [imageSource, setImageSource] = useState([]);

    useEffect(() => {
        setImageSource(route.params.collection);
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
                <Carousel
                    layout='default'
                    data={imageSource}
                    sliderWidth={screenWidth}
                    itemWidth={screenWidth}
                    itemHeight={screenHeight}
                    renderItem={({ item, index }) => (
                        <FastImage
                            key={index}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode='contain'
                            source={{uri:item.image}}
                        />
                    )}
                />
            </View>
        </View>
    );
};
