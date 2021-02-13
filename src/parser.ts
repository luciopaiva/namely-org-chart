
export class Person {
    public id: string;
    public name: string;
    public title: string;
    public parentId: string|undefined;
    public imgUrlBig: string;
    public imgUrlMedium: string;
    public imgUrlSmall: string;
    public parent: Person|undefined;
    public children: Person[] = [];

    constructor(obj: any) {
        if (typeof obj["id"] !== "string") {
            throw new Error(`Field id is mandatory`);
        }
        this.id = obj["id"];
        this.name = obj["full_name"];
        this.title = obj["job_title"];
        this.parentId = obj["parent_id"];
        this.imgUrlBig = obj["imd_75_cdn"];
        this.imgUrlMedium = obj["imd_40_cdn"];
        this.imgUrlSmall = obj["imd_36_cdn"];
    }

    hasParent(): boolean {
        return typeof this.parentId === "string" && this.parentId.length > 0;
    }
}

export class Parser {
    private personById: Map<String, Person> = new Map();
    private root: Person|undefined;

    constructor(response: any) {
        const people = response.people;
        this.preparePeople(people);
        this.linkParentsAndChildren();
        this.findRootPerson();
        this.countLeafNodes();
        this.findTreeHeight();
        this.findMaximumDegree();
    }

    getRoot(): Person {
        return this.root as Person;
    }

    preparePeople(people: any[]) {
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
            parent?.children.push(person);
        }
    }

    findRootPerson() {
        let root: Person|undefined = undefined;
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
        const height = this.iterateTreeHeight(this.root as Person);
        console.info(`Tree height: ${height}`);
    }

    private iterateTreeHeight(person: Person, level: number = 1): number {
        let maxHeight = level;
        for (const child of person.children) {
            const childHeight = this.iterateTreeHeight(child, level + 1);
            if (childHeight > maxHeight) {
                maxHeight = childHeight;
            }
        }
        return maxHeight;
    }

    private iterateTreeSize(root: Person|undefined): number {
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
