import * as React from 'react';
import {useState, useEffect} from 'react';
import { SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList, Image,} from 'react-native';

import { View } from '../components/Themed';
import { RootTabScreenProps } from '../components/types';
import FastImage from 'react-native-fast-image';
import {ImageDataSource} from "../data/ImageDataSource";

export default function SaufotoGalleryScreen({ navigation }: RootTabScreenProps<'Library'>) {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    setDataSource(ImageDataSource());
  }, []);

  const showModalFunction = (id) => {
    //handler to handle the click on image of Grid
    //and close button on modal
    navigation.navigate('ImageView', {selected: id, collection:dataSource })
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
    backgroundColor: '#777777',
  },
  titleStyle: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    backgroundColor: 'green',
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
  fullImageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '98%',
    resizeMode: 'contain',
  },
  modelStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButtonStyle: {
    width: 25,
    height: 25,
    top: 50,
    right: 20,
    position: 'absolute',
  },
});
