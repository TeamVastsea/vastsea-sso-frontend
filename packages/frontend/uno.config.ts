import wind4 from '@unocss/preset-wind4';
import { defineConfig, presetIcons, presetTypography } from 'unocss';

export default defineConfig({
  presets: [
    wind4({ dark: 'class' }),
    presetTypography(),
    presetIcons(),
  ],
});
