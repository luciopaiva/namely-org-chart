
// adapted from https://stackoverflow.com/a/28226022/778272
export default class DropZone {
    private readonly callback: Function;
    private zone: HTMLDivElement;
    private message: HTMLParagraphElement;

    constructor(callback: Function) {
        this.callback = callback;
        this.zone = document.getElementById("drop-zone") as HTMLDivElement;
        this.message = this.zone.querySelector(".message") as HTMLParagraphElement;

        this.zone.addEventListener("dragover", e => {
            e.stopPropagation();
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
            }
        });

        this.zone.addEventListener("drop", e => {
            e.stopPropagation();
            e.preventDefault();
            if (e.dataTransfer?.files?.length ?? 0 > 0) {
                const file = e.dataTransfer?.files[0] as File;
                if (file.type === "application/json") {
                    this.readFile(file);
                } else {
                    this.setMessage(`File needs to be JSON (received type "${file.type}").`);
                }
            }
        });

        let lastTarget: any = null;
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

    readFile(file: File) {
        this.setMessage("Loading...");
        const reader = new FileReader();
        reader.addEventListener("load", e => {
            const text = e.target?.result as string;
            this.callback(JSON.parse(text));
            this.hide();
        });
        reader.readAsText(file);
    }

    setMessage(msg: string) {
        this.message.innerText = msg;
    }
}
