import {terser} from "rollup-plugin-terser";

export default {
    input: "dist/index.js",
    output: [
        {
            file: "dist/bundle.js",
            format: "iife",
            sourcemap: true,
        },
        {
            file: "dist/bundle.min.js",
            format: "iife",
            sourcemap: true,
            plugins: [terser()],
        },
    ],
    external: ["pixi.js"]
}
