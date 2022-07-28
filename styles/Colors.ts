
const color = {
    a100: '#b388ff',
    c800: '#4527a0',
    c600: '#5e35b1',
    c300: '#9575CD',
    c200: '#B39DDB',
    c100: '#D1C4E9',
    c50: '#EDE7F6',
    c10:'#FDF7FE',
    black:'#000000'
}

export default {
  light: {
    text: color.c800,
    background: color.c10,
    tint: color.c100,
    tabIconDefault: color.c200,
    tabIconSelected: color.c600,
    tabBackground: color.c50,
    black:color.black
  },
  dark: {
    text: color.c10,
    background: color.c800,
    tint: color.c300,
    tabIconDefault: color.c600,
    tabIconSelected: color.c200,
    tabBackground: color.c300,
    black:color.black
  },
  colors: color,
};

/*
<color name="colorPrimary">@color/c600</color>
    <color name="colorPrimaryDark">@color/c800</color>
    <color name="colorAccent">@color/a100</color>
    <color name="colorBackground">@color/c50</color>


    <color name="black">@color/colorPrimaryDark</color>
    <color name="white">@color/c50</color>
    <color name="transparent">#00000000</color>
<color name="select">#504527a0</color>
    <!--color name="black">#000000</color-->

 */
