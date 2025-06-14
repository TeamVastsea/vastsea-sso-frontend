import { defineConfig, presetWind4, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      autoInstall: true,
    })
  ],
});
