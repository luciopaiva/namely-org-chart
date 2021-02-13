import {terser} from "rollup-plugin-terser";

export default {
    input: "dist/index.js",
    output: [
        {
            file: "dist/bundle.js",
            format: "iife",
            sourcemap: true,
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
    external: ["d3", "d3-hierarchy"]
}
