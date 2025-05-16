/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4A80F0';
const tintColorDark = '#5D8BF4';

export const Colors = {
  light: {
    text: '#202124',
    background: '#F8F9FA',
    tint: tintColorLight,
    icon: '#5F6368',
    tabIconDefault: '#5F6368',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    tint: tintColorDark,
    icon: '#A1A7B0',
    tabIconDefault: '#A1A7B0',
    tabIconSelected: tintColorDark,
  },
};
