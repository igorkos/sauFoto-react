import * as React from 'react';
import { View } from '../components/Themed';
import { RootTabScreenProps } from './drawer/types';
import {useState, useEffect} from 'react';
import { SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ImageDataSource} from "../data/ImageDataSource";
import {theme} from "../constants/themes";

export default function SaufotoGalleryScreen({ navigation }: RootTabScreenProps<'GalleryScreen'>) {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    setDataSource(ImageDataSource());
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
