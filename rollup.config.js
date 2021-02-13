import {terser} from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/index.ts",
    output: [
        {
            file: "dist/bundle.js",
            format: "iife",
            sourcemap: true,
            plugins: [terser()],
            globals: {
                "d3": "d3",
                "d3-hierarchy": "d3"
            },
        },
        {
            file: "dist/bundle.min.js",
            format: "iife",
            sourcemap: true,
            plugins: [terser()],
            globals: {
                "d3": "d3",
                "d3-hierarchy": "d3"
            },
        },
    ],
    plugins: [typescript()],
    external: ["d3", "d3-hierarchy"]
}
