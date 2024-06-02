"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const create_bas_toolkit_api_1 = require("../../src/public-api/create-bas-toolkit-api");
describe("the `createBasToolkitAPI()` utility", () => {
    let basToolkit;
    before(() => {
        /* eslint-disable @typescript-eslint/no-unsafe-return -- test dummy mock */
        const dummyReturnArgsWorkspaceImpl = {
            getProjects() {
                return 333;
            },
        };
        const dummyBaseBasToolkitApi = {
            getAction() {
                return 666;
            },
        };
        /* eslint-enable  @typescript-eslint/no-unsafe-return -- test dummy mock */
        basToolkit = (0, create_bas_toolkit_api_1.createBasToolkitAPI)(dummyReturnArgsWorkspaceImpl, dummyBaseBasToolkitApi);
    });
    describe("the returned API object", () => {
        it("is frozen", () => {
            (0, chai_1.expect)(basToolkit).to.be.frozen;
        });
        it("includes functions from baseBasToolkit", () => {
            (0, chai_1.expect)(basToolkit).to.have.property("getAction");
            (0, chai_1.expect)(basToolkit.getAction("foo")).to.equal(666);
        });
        it("includes workspaceAPI namespace & methods", () => {
            (0, chai_1.expect)(basToolkit).to.have.property("workspaceAPI");
            (0, chai_1.expect)(Object.keys(basToolkit.workspaceAPI)).to.have.members([
                "getProjects",
                "getProject",
                "getProjectUris",
                "onWorkspaceChanged",
                "getPluginManager",
            ]);
            (0, chai_1.expect)(basToolkit.workspaceAPI.getProjects()).to.equal(333);
        });
    });
});
//# sourceMappingURL=create-bas-toolkit-api.spec.js.map