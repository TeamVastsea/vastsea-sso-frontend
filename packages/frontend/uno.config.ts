import wind4 from "@unocss/preset-wind4";
import { defineConfig, presetIcons, presetTypography } from "unocss";

export default defineConfig({
  presets: [
    wind4({ dark: "class" }),
    presetTypography(),
    presetIcons({
      collections: {
        tabler: () => import("@iconify-json/tabler").then((i) => i.default),
        material: () =>
          import("@iconify-json/material-symbols").then((i) => i.default),
      },
    }),
  ],
});
