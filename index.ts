
import * as PIXI from "pixi.js";

function run() {
    // this is just to demonstrate that the import worked
    // will print PixiJS's version message to the browser console
    new PIXI.Application({
        antialias: true,
        view: document.getElementById("map") as HTMLCanvasElement,
        width: 800,
        height: 600,
    });

    // demo using TypeScript syntax
    const div: HTMLDivElement = document.createElement("div");
    div.innerText = "Hello";
    document.querySelector("body")?.appendChild(div);
}

window.addEventListener("load", run);
