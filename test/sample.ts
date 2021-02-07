
import {describe, it} from "mocha";
import assert from "assert";

describe("Sample", () => {

    it("should always pass", () => {
        // does nothing
    });

    it("should correctly sum numbers", () => {
        const a = 2;
        const b = 3;
        const c = a + b;
        assert.strictEqual(c, 5);
    });
});
