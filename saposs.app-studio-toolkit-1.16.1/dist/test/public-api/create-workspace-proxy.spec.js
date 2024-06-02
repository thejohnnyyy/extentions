"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const artifact_management_1 = require("@sap/artifact-management");
const chai_1 = require("chai");
const create_workspace_proxy_1 = require("../../src/public-api/create-workspace-proxy");
describe("the `createWorkspaceProxy` utility", () => {
    let workspaceProxy;
    before(() => {
        /* eslint-disable @typescript-eslint/no-unsafe-return -- test dummy mock */
        const dummyReturnArgsWorkspaceImpl = {
            getProjects(...args) {
                return args;
            },
            getProject(...args) {
                return args;
            },
            getProjectUris(...args) {
                return args;
            },
            onWorkspaceChanged(...args) {
                return args;
            },
            getPluginManager(...args) {
                return args;
            },
        };
        /* eslint-enable  @typescript-eslint/no-unsafe-return -- test dummy mock */
        workspaceProxy = (0, create_workspace_proxy_1.createWorkspaceProxy)(dummyReturnArgsWorkspaceImpl);
    });
    context("WorkspaceProxy Object", () => {
        it("is frozen", () => {
            (0, chai_1.expect)(workspaceProxy).to.be.frozen;
        });
        it("is sealed", () => {
            (0, chai_1.expect)(workspaceProxy).to.be.sealed;
        });
        it("exposes only five properties", () => {
            (0, chai_1.expect)(Object.keys(workspaceProxy)).to.have.lengthOf(5);
        });
    });
    context("`getProjects()` method", () => {
        it("is exposed", () => {
            (0, chai_1.expect)(workspaceProxy).to.have.property("getProjects");
            (0, chai_1.expect)(typeof workspaceProxy.getProjects).to.equal("function");
        });
        it("passes through arguments", () => {
            (0, chai_1.expect)(workspaceProxy.getProjects(artifact_management_1.Tag.CAP)).to.deep.equal([artifact_management_1.Tag.CAP]);
        });
    });
    context("`getProject()` method", () => {
        it("is exposed", () => {
            (0, chai_1.expect)(workspaceProxy).to.have.property("getProject");
            (0, chai_1.expect)(typeof workspaceProxy.getProject).to.equal("function");
        });
        it("passes through arguments", () => {
            (0, chai_1.expect)(workspaceProxy.getProject("dummyPath")).to.deep.equal([
                "dummyPath",
            ]);
        });
    });
    context("`getProjectUris()` method", () => {
        it("is exposed", () => {
            (0, chai_1.expect)(workspaceProxy).to.have.property("getProjectUris");
            (0, chai_1.expect)(typeof workspaceProxy.getProjectUris).to.equal("function");
        });
        it("passes through arguments", () => {
            // @ts-expect-error -- `getProjectUris` has no arguments, but we cannot assume it will
            //                      never have any arguments so the pass-through is still implemented and tested.
            (0, chai_1.expect)(workspaceProxy.getProjectUris("dummyArg")).to.deep.equal([
                "dummyArg",
            ]);
        });
    });
    context("`onWorkspaceChanged()` method", () => {
        it("is exposed", () => {
            (0, chai_1.expect)(workspaceProxy).to.have.property("onWorkspaceChanged");
            (0, chai_1.expect)(typeof workspaceProxy.onWorkspaceChanged).to.equal("function");
        });
        it("passes through arguments", () => {
            const changeHandler = (event, folders) => { };
            (0, chai_1.expect)(workspaceProxy.onWorkspaceChanged(changeHandler)).to.deep.equal([
                changeHandler,
            ]);
        });
    });
    context("`getPluginManager()` method", () => {
        it("is exposed", () => {
            (0, chai_1.expect)(workspaceProxy).to.have.property("getPluginManager");
            (0, chai_1.expect)(typeof workspaceProxy.getPluginManager).to.equal("function");
        });
        it("passes through arguments", () => {
            // @ts-expect-error -- `getPluginManager` has no arguments, but we cannot assume it will
            //                      never have any arguments so the pass-through is still implemented and tested.
            (0, chai_1.expect)(workspaceProxy.getPluginManager("dummyArg")).to.deep.equal([
                "dummyArg",
            ]);
        });
    });
});
//# sourceMappingURL=create-workspace-proxy.spec.js.map