import * as React from 'react';
import {screenHeight, screenWidth, View} from '../components/Themed';
import {useState, useEffect} from 'react';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';
import {theme} from "../constants/themes";
import {Log} from "../hooks/log";
import PhotoView from 'react-native-photo-view';

export default function ImageView({navigation, route}) {
    Log.debug("Image Preview: start position " + route.params.selected)
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
                <Carousel
                    slideStyle={{ width: screenWidth }}
                    layout='default'
                    data={route.params.collection}
                    firstItem={route.params.selected}
                    initialScrollIndex={route.params.selected}
                    lockScrollWhileSnapping={true}
                    getItemLayout={(data, index) => (
                        {length: screenWidth, offset: screenWidth * index, index}
                    )}
                    sliderWidth={screenWidth}
                    itemWidth={screenWidth}
                    itemHeight={screenHeight}
                    renderItem={({ item, index }) => (
                        <PhotoView
                            source={{uri:item.image}}
                            minimumZoomScale={1}
                            maximumZoomScale={10}
                            androidScaleType="fitCenter"
                            onLoad={() => Log.debug("Image loaded!" + index)}
                            style={{flex: 1}} />
                    )}
                />
            </View>
        </View>
    );
};

/*
<FastImage
                            key={index}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode='contain'
                            source={{uri:item.image}}
                        />
 */
