
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

        const treeLayoutBuilder = tree<Person>().nodeSize([50, 50]);
        const rootPerson: HierarchyNode<Person> = hierarchy(parser.getRoot());
        const root = treeLayoutBuilder(rootPerson);

        const zoom = d3.zoom().scaleExtent([0.5, 3]).on("zoom", this.redraw.bind(this));

        const svg = d3.select("body").append("svg");
        const width = 1800;

        const [x0, x1] = this.getBounds(root);

        const linkFn = d3.linkHorizontal<HierarchyPointLink<Person>, HierarchyPointNode<Person>>().x(d => d.y).y(d => d.x)

        svg.attr("viewBox", [0, 0, width, x1 - x0 + root.x * 2].toString());
        const g = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("transform", `translate(${root.y / 3},${root.x - x0})`);

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

        node.append("circle")
            .attr("fill", d => d.children ? "#555" : "#999")
            .attr("r", 2.5);

        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.children ? -6 : 6)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");

        svg.call(zoom as any);
            // .append("g")
            // .attr("transform", `translate(${800/2}, 20)`);
        // zoomBehavior.translateTo([0, 0]);
    }

    getBounds(root: HierarchyPointNode<Person>): [number, number] {
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

    redraw() {
        console.info("redraw called");
    }
}

window.addEventListener("load", () => new App("example.json"));
