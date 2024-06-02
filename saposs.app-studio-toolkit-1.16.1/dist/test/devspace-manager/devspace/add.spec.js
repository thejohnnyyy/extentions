"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
describe("cmdDevSpaceAdd unit test", () => {
    let devspaceAddProxy;
    const landscapeProxy = {
        autoRefresh: (rate, timeout) => { },
    };
    before(() => {
        devspaceAddProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/add", {
            "../landscape/landscape": landscapeProxy,
        });
    });
    let mockLandscape;
    beforeEach(() => {
        mockLandscape = (0, sinon_1.mock)(landscapeProxy);
    });
    afterEach(() => {
        mockLandscape.verify();
    });
    const node = {};
    it("cmdLandscapeOpenDevSpaceManager, open true", async () => {
        mockLandscape.expects(`autoRefresh`).returns(true);
        await devspaceAddProxy.cmdDevSpaceAdd(node);
    });
});
//# sourceMappingURL=add.spec.js.map