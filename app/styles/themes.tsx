// import {vars} from 'nativewind';
import {ThemeColorSets} from '@styles/types';
import {applyThemes} from '@styles/utils';

export const themeColorSets: ThemeColorSets = {
  default: {
    light: {
      primary: '#8e6cef',
      background: 'white',
      backgroundSecondary: '#F0F3F8',
      content: '#18181b',
      contentSecondary: 'white',
    },
    dark: {
      primary: '#8e6cef',
      background: '#1A1A1D',
      backgroundSecondary: '#3C3D37',
      content: 'white',
      contentSecondary: 'white',
    },
  },
  vintage: {
    light: {
      primary: '#C96868',
      background: '#FFF4EA',
      backgroundSecondary: '#FFFFFF',
      content: 'black',
      contentSecondary: 'white',
    },
    dark: {
      primary: '#C96868',
      background: '#131010',
      backgroundSecondary: '#543A14',
      content: 'white',
      contentSecondary: 'white',
    },
  },
};

export const themes = applyThemes(themeColorSets);

//https://colorhunt.co/palette/c96868fadfa1fff4ea7eacb5
//https://colorhunt.co/palette/3c552dca7373d7b26deee2b5
