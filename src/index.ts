
import d3, {HierarchyNode, HierarchyPointLink, HierarchyPointNode} from "d3";
import {tree, hierarchy} from "d3-hierarchy";
import {Parser, Person} from "./parser";

class App {
    constructor(fileName: string) {
        d3.json(fileName).then(data => this.drawChart(data));
    }

    drawChart(data: any) {
        console.info(data);
        const parser = new Parser(data);

        const personCellWidth = 200;
        const personCellHeight = 25;

        const treeLayoutBuilder = tree<Person>().nodeSize([personCellHeight, personCellWidth]);
        const rootPerson: HierarchyNode<Person> = hierarchy(parser.getRoot());
        const root = treeLayoutBuilder(rootPerson);

        const svg = d3.select("body").append("svg");

        const [x0, x1] = this.getHorizontalBounds(root);
        const [y0, y1] = this.getVerticalBounds(root);

        const linkFn = d3.linkHorizontal<HierarchyPointLink<Person>, HierarchyPointNode<Person>>()
            .x(d => d.y).y(d => d.x)

        const width = y1 - y0 + personCellWidth * 2;
        const height = x1 - x0 + personCellHeight * 4;

        svg.attr("viewBox", [0, 0, width, height].toString());
        const g = svg.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("transform", `translate(${personCellWidth}, ${-x0 + personCellHeight/2})`);

        // draw links between nodes
        g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", linkFn);

        const node = g.append("g")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("svg:image")
            .attr("width", 16)
            .attr("height", 16)
            .attr("x", -8)
            .attr("y", -8)
            .attr("xlink:href", "person.png");

        node.append("text")
            .attr("dy", "0.0em")
            .attr("x", d => d.children ? -8 : 8)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");

        node.append("text")
            .attr("dy", "1.0em")
            .attr("x", d => d.children ? -8 : 8)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .attr("fill", "#888")
            .text(d => d.data.title)
            .clone(true).lower()
            .attr("stroke", "white");
    }

    getHorizontalBounds(root: HierarchyPointNode<Person>): [number, number] {
        let x0 = Infinity;
        let x1 = -Infinity;
        root.each(d => {
            if (d.x > x1) {
                x1 = d.x;
            }
            if (d.x < x0) {
                x0 = d.x;
            }
        });
        return [x0, x1];
    }

    getVerticalBounds(root: HierarchyPointNode<Person>): [number, number] {
        let y0 = Infinity;
        let y1 = -Infinity;
        root.each(d => {
            if (d.y > y1) {
                y1 = d.y;
            }
            if (d.y < y0) {
                y0 = d.y;
            }
        });
        return [y0, y1];
    }

    redraw() {
        console.info("redraw called");
    }
}

window.addEventListener("load", () => new App("example.json"));
