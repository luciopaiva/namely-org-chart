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
            const container = document.getElementById("container");
            container.innerHTML = "";
            const svg = d3__default['default'].select("#container").append("svg");
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

    // adapted from https://stackoverflow.com/a/28226022/778272
    class DropZone {
        constructor(callback) {
            this.callback = callback;
            this.zone = document.getElementById("drop-zone");
            this.message = this.zone.querySelector(".message");
            this.zone.addEventListener("dragover", e => {
                e.stopPropagation();
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = "copy";
                }
            });
            this.zone.addEventListener("drop", e => {
                var _a, _b, _c, _d;
                e.stopPropagation();
                e.preventDefault();
                if ((_c = (_b = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0 > 0) {
                    const file = (_d = e.dataTransfer) === null || _d === void 0 ? void 0 : _d.files[0];
                    if (file.type === "application/json") {
                        this.readFile(file);
                    }
                    else {
                        this.setMessage(`File needs to be JSON (received type "${file.type}").`);
                    }
                }
            });
            let lastTarget = null;
            window.addEventListener("dragenter", e => {
                this.show();
                lastTarget = e.target;
            });
            window.addEventListener("dragleave", e => {
                // console.info(e.target);
                if (e.target === lastTarget) {
                    this.hide();
                }
            });
        }
        show() {
            this.setMessage("Drop JSON file imported from Namely here");
            this.zone.style.visibility = "";
            this.zone.style.opacity = "1";
        }
        hide() {
            this.zone.style.visibility = "hidden";
            this.zone.style.opacity = "0";
        }
        readFile(file) {
            this.setMessage("Loading...");
            const reader = new FileReader();
            reader.addEventListener("load", e => {
                var _a;
                const text = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                this.callback(JSON.parse(text));
                this.hide();
            });
            reader.readAsText(file);
        }
        setMessage(msg) {
            this.message.innerText = msg;
        }
    }

    function main() {
        const app = new App("example.json");
        new DropZone(app.drawChart.bind(app));
    }
    window.addEventListener("load", main);

}(d3, d3));
