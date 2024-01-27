import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import type { ForgeConfig } from "@electron-forge/shared-types";
// import { MakerFlatpak } from "@electron-forge/maker-flatpak";
import { VitePlugin } from "@electron-forge/plugin-vite";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "icons/icon",
  },
  rebuildConfig: {},
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "tegaki-tegaki",
          name: "croquis-desktop",
        },
      },
    },
  ],
  makers: [
    new MakerSquirrel({
      // iconUrl: "",
      setupIcon: "icons/icon.ico",
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerDeb({
      options: {
        icon: "icons/icon.png",
      },
    }),
    // new MakerFlatpak({
    //   options: {
    //     files: [],
    //     categories: ["Utility", "Education"],
    //   },
    // }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
  ],
};

export default config;
