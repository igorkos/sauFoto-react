import * as React from 'react';
import {
    DefaultTheme as PaperDefaultTheme,
    DarkTheme as PaperDarkTheme,
} from 'react-native-paper';

import {
    DefaultTheme as NavigationDefaultTheme,
    DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';

import Colors from './Colors';

const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        ...PaperDefaultTheme.colors,
        background: Colors.light.background,
        text: Colors.light.text,
        textDark: Colors.dark.text,
        tint:Colors.dark.tint,
        headerBackground: Colors.light.tabBackground,
        tabBarBackground: Colors.dark.tabBackground,
    },
};

const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        ...PaperDarkTheme.colors,
        background: Colors.dark.background,
        text: Colors.dark.text,
        textDark: Colors.light.text,
        tint:Colors.light.tint,
        headerBackground: Colors.dark.tabBackground,
        tabBarBackground: Colors.dark.tabBackground,
    },
};

export const [isDarkTheme, setIsDarkTheme] = React.useState(false);

export const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

