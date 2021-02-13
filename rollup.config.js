import {terser} from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

export default {
    input: "src/index.ts",
    output: [
        {
            file: "docs/bundle.js",
            format: "iife",
            plugins: [],
            globals: {
                "d3": "d3",
                "d3-hierarchy": "d3"
            },
        },
        {
            file: "docs/bundle.min.js",
            format: "iife",
            plugins: [terser()],
            globals: {
                "d3": "d3",
                "d3-hierarchy": "d3"
            },
        },
    ],
    plugins: [
        typescript(),
        copy({
            targets: [
                { src: "node_modules/d3/dist/d3.min.js", dest: "docs/" },
                { src: "node_modules/d3-hierarchy/dist/d3-hierarchy.min.js", dest: "docs/" },
            ]
        }),
    ],
    external: ["d3", "d3-hierarchy"]
}
