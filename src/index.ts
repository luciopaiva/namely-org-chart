
import App from "./app";
import DropZone from "./drop-zone";

function main() {
    const app = new App("example.json");
    new DropZone(app.drawChart.bind(app));
}

window.addEventListener("load", main);
