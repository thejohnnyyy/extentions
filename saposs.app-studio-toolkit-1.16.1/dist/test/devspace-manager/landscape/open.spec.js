"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mockUtil_1 = require("../../../test/mockUtil");
const sinon_1 = require("sinon");
const testVscode = {
    env: {
        openExternal: () => {
            throw new Error("not implemented");
        },
    },
    Uri: {
        parse: () => {
            throw new Error("not implemented");
        },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/devspace-manager/landscape/open.js");
const open_1 = require("../../../src/devspace-manager/landscape/open");
describe("landscapes open unit test", () => {
    let mockUrl;
    let mockEnv;
    beforeEach(() => {
        mockUrl = (0, sinon_1.mock)(testVscode.Uri);
        mockEnv = (0, sinon_1.mock)(testVscode.env);
    });
    afterEach(() => {
        mockUrl.verify();
        mockEnv.verify();
    });
    const node = {
        label: "landscape-1",
        url: "https://my.landscape-1.com",
    };
    const url = {
        host: node.url,
    };
    it("cmdLandscapeOpenDevSpaceManager, open true", async () => {
        mockUrl.expects("parse").withExactArgs(node.url).returns(url);
        mockEnv.expects("openExternal").withExactArgs(url).resolves(true);
        (0, chai_1.expect)(await (0, open_1.cmdLandscapeOpenDevSpaceManager)(node)).to.be.true;
    });
    it("cmdLandscapeOpenDevSpaceManager, open false", async () => {
        mockUrl.expects("parse").withExactArgs(node.url).returns(url);
        mockEnv.expects("openExternal").withExactArgs(url).resolves(false);
        (0, chai_1.expect)(await (0, open_1.cmdLandscapeOpenDevSpaceManager)(node)).to.be.false;
    });
});
//# sourceMappingURL=open.spec.js.map