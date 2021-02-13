(function (d3, d3Hierarchy) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var d3__default = /*#__PURE__*/_interopDefaultLegacy(d3);

    class Person {
        constructor(obj) {
            this.children = [];
            if (typeof obj["id"] !== "string") {
                throw new Error(`Field id is mandatory`);
            }
            this.id = obj["id"];
            this.name = obj["full_name"];
            this.title = obj["job_title"];
            this.parentId = obj["parent_id"];
            this.imgUrlBig = obj["img_75_cdn"];
            this.imgUrlMedium = obj["img_40_cdn"];
            this.imgUrlSmall = obj["img_36_cdn"];
        }
        hasParent() {
            return typeof this.parentId === "string" && this.parentId.length > 0;
        }
    }
    class Parser {
        constructor(response) {
            this.personById = new Map();
            const people = response.people;
            this.preparePeople(people);
            this.linkParentsAndChildren();
            this.findRootPerson();
            this.countLeafNodes();
            this.findTreeHeight();
            this.findMaximumDegree();
        }
        getRoot() {
            return this.root;
        }
        preparePeople(people) {
            for (const obj of people) {
                const person = new Person(obj);
                this.personById.set(person.id, person);
            }
            console.info(`Total people found: ${this.personById.size}`);
        }
        linkParentsAndChildren() {
            for (const person of this.personById.values()) {
                const parent = person.parentId ? this.personById.get(person.parentId) : undefined;
                person.parent = parent;
                parent === null || parent === void 0 ? void 0 : parent.children.push(person);
            }
        }
        findRootPerson() {
            let root = undefined;
            let rootHeight = 0;
            // select root based on orphan with largest tree below it
            for (const person of this.personById.values()) {
                if (!person.hasParent()) {
                    console.info(`Root candidate: "${person.name}"`);
                    const height = this.iterateTreeSize(person);
                    if (root === undefined || height > rootHeight) {
                        root = person;
                        rootHeight = height;
                    }
                }
            }
            if (!(root instanceof Person)) {
                throw new Error("Did not find a root!");
            }
            this.root = root;
            this.pruneOrphans();
            console.info(`Selected root person: "${this.root.name}"`);
            console.info(`Total people after root selection: ${this.personById.size}`);
        }
        pruneOrphans() {
            for (const person of this.personById.values()) {
                if (!person.hasParent() && person !== this.root) {
                    console.info(`Pruning orphan ${person.name}`);
                    this.personById.delete(person.id);
                }
            }
        }
        countLeafNodes() {
            let count = 0;
            for (const person of this.personById.values()) {
                if (person.children.length === 0) {
                    count++;
                }
            }
            const percent = (100 * (count / this.personById.size)).toFixed(1);
            console.info(`Total leaf nodes: ${count} (${percent}%)`);
        }
        findTreeHeight() {
            const height = this.iterateTreeHeight(this.root);
            console.info(`Tree height: ${height}`);
        }
        iterateTreeHeight(person, level = 1) {
            let maxHeight = level;
            for (const child of person.children) {
                const childHeight = this.iterateTreeHeight(child, level + 1);
                if (childHeight > maxHeight) {
                    maxHeight = childHeight;
                }
            }
            return maxHeight;
        }
        iterateTreeSize(root) {
            let size = 0;
            if (root instanceof Person) {
                size++;
                for (const child of root.children) {
                    size += this.iterateTreeSize(child);
                }
            }
            return size;
        }
        findMaximumDegree() {
            let maxDegree = 0;
            let name = "";
            for (const person of this.personById.values()) {
                const degree = person.children.length;
                if (degree > maxDegree) {
                    maxDegree = degree;
                    name = person.name;
                }
            }
            console.info(`Max node degree is ${maxDegree} ("${name}")`);
        }
    }

    class App {
        constructor(fileName) {
            d3__default['default'].json(fileName).then(data => this.drawChart(data));
        }
        drawChart(data) {
            console.info(data);
            const parser = new Parser(data);
            const personCellWidth = 200;
            const personCellHeight = 25;
            const treeLayoutBuilder = d3Hierarchy.tree().nodeSize([personCellHeight, personCellWidth]);
            const rootPerson = d3Hierarchy.hierarchy(parser.getRoot());
            const root = treeLayoutBuilder(rootPerson);
            const svg = d3__default['default'].select("body").append("svg");
            const [x0, x1] = this.getHorizontalBounds(root);
            const [y0, y1] = this.getVerticalBounds(root);
            const linkFn = d3__default['default'].linkHorizontal()
                .x(d => d.y).y(d => d.x);
            const width = y1 - y0 + personCellWidth * 2;
            const height = x1 - x0 + personCellHeight * 4;
            svg.attr("viewBox", [0, 0, width, height].toString());
            const g = svg.append("g")
                .attr("width", width)
                .attr("height", height)
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("transform", `translate(${personCellWidth}, ${-x0 + personCellHeight / 2})`);
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
        getHorizontalBounds(root) {
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
        getVerticalBounds(root) {
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

}(d3, d3));
//# sourceMappingURL=bundle.js.map
