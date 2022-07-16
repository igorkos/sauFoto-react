import {useWindowDimensions} from 'react-native';
import {ServiceType} from "../data/ServiceType";

const screen = useWindowDimensions()
export var screenHeight = screen.height
export var screenWidth = screen.width

export const FlatListItemSizes = {
  Dropbox:{
    album:{
      width:  screenWidth/2 - 6,
      height: screenWidth/2 - 6,
      layout: (screenWidth/2 - 6) + 40
    },
    image:{
      width: screenWidth/2 - 6,
      height:screenWidth/2 - 6,
      layout: (screenWidth/2 - 6) + 40
    }
  },
  Google:{
    album:{
      width:screenWidth/2 - 6,
      height:screenWidth/2 - 6,
      layout: (screenWidth/2 - 6) + 40
    },
    image:{
      width:screenWidth/3 - 2,
      height:screenWidth/3 - 2,
      layout: screenWidth/3 - 2,
    }
  },
  Camera:{
    album:{
      width:screenWidth/2 - 6,
      height:screenWidth/2 - 6,
      layout:(screenWidth/2 - 6) + 40
    },
    image:{
      width:screenWidth/3 - 2,
      height:screenWidth/3 - 2,
      layout:screenWidth/3 - 2
    }
  },
  Test:{
    album:{
      width:screenWidth/2 - 6,
      height:screenWidth/2 - 6,
      layout: (screenWidth/2 - 6) + 40
    },
    image:{
      width:screenWidth/3 - 2,
      height:screenWidth/3 - 2,
      layout:screenWidth/3 - 2,
    }
  }
}
