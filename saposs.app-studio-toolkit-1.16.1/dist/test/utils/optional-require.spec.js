"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const optional_require_1 = require("../../src/utils/optional-require");
describe("the optionalRequire utility", () => {
    it("return undefined if a module does not exist", () => {
        // unicode heart is not a valid module name (at least currently).
        const tinManHeart = (0, optional_require_1.optionalRequire)("♥");
        (0, chai_1.expect)(tinManHeart).to.be.undefined;
    });
    context("with a module that throws an error during init", () => {
        before(() => {
            delete global.basketBall;
        });
        it("silently return undefined if a module throws an error", () => {
            (0, chai_1.expect)(global.basketBall).to.be.undefined;
            const optionalModule = (0, optional_require_1.optionalRequire)(
            // local require reference not supported
            // so we have to pass the path relative to our `optional-require` module
            "../../test/utils/samples/throwing-module");
            (0, chai_1.expect)(optionalModule).to.be.undefined;
            (0, chai_1.expect)(global.basketBall).to.be.true;
        });
        after(() => {
            delete global.basketBall;
        });
    });
    it("returns the module if it exist", () => {
        // `crypto` is built-in in nodejs and should always be available
        const cryptoBubble = (0, optional_require_1.optionalRequire)("crypto");
        (0, chai_1.expect)(cryptoBubble).to.exist;
        // @ts-expect-error -- dynamic import
        (0, chai_1.expect)(cryptoBubble.Cipher).to.exist;
    });
});
//# sourceMappingURL=optional-require.spec.js.map