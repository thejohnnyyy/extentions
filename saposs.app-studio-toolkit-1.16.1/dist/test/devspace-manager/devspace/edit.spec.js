"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxyquire_1 = __importDefault(require("proxyquire"));
describe("cmdDevSpaceEdit unit test", () => {
    let devspaceEditProxy;
    before(() => {
        devspaceEditProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/edit", {});
    });
    const node = {};
    it("cmdDevSpaceEdit, ok", async () => {
        await devspaceEditProxy.cmdDevSpaceEdit(node);
    });
});
//# sourceMappingURL=edit.spec.js.map