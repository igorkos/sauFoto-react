/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */
import * as React from 'react';
import {Text as DefaultText, useWindowDimensions, View as DefaultView} from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import {Menu, MenuProps} from 'react-native-material-menu';
import * as Progress from 'react-native-progress';
import {CirclePropTypes} from "react-native-progress";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}



const screen = useWindowDimensions()
export var screenHeight = screen.height
export var screenWidth = screen.width

interface MenuFix extends React.Component<MenuProps> {}

export const SMenu = (Menu as any) as {
  new(): MenuFix;
};

interface ProgressCircledFix extends React.Component<CirclePropTypes> {}

export const ProgressCircle = (Progress.Circle as any) as {
  new(): ProgressCircledFix;
};


