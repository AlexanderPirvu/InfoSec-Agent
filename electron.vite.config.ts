import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [react()],
  },
});

// // electron.vite.config.js
// import { defineConfig } from "electron-vite"
// // import * as path from 'path'

// export default defineConfig({
//     main: {
//         build: {
//             outDir: 'release/main',
//             lib: {
//                 entry: 'electron/main.ts',
//                 name: "InfoSec"
//             }
//         }
//     },
//     preload: {
//         build: {
//             lib: {
//                 entry: 'electron/preload.ts',
//                 name: "InfoSec"
//             },
//             outDir: 'release/preload',
//             // rollupOptions: {
//             //     input: path.join(__dirname, 'electron/preload.ts'),
//             // }
//         }
//     },
//     renderer: {
//         build: {
//             outDir: 'release/renderer',
//             lib: {
//                 entry: 'index.html',
//                 name: "InfoSec"
//             },
//             rollupOptions: {
//                 input: 'index.html'
//             }
//         }
//     },
// })
