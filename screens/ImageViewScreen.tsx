import * as React from 'react';
import { View } from '../components/Themed';
import {
  Image,
  Dimensions
} from 'react-native';
import {useState, useEffect} from 'react';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';

const { height, width } = Dimensions.get('window');

export default function ImageView({navigation, route}) {
  const [imageSource, setImageSource] = useState([]);

  useEffect(() => {
      setImageSource(route.params.collection);
  }, []);

  return (
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center' }}>
        {/* Title JSX Remains same */}
        {/* Carousel View */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <Carousel
              layout='stack'
              data={imageSource}
              sliderWidth={width}
              itemWidth={width}
              itemHeight={height}
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
