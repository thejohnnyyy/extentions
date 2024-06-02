"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mockUtil_1 = require("./mockUtil");
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const _ = __importStar(require("lodash"));
const sinon_1 = require("sinon");
const constants_1 = require("../src/constants");
(0, chai_1.use)(chai_as_promised_1.default);
const extensions = { getExtension: () => "" };
const testVscode = {
    extensions: extensions,
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/api.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/controller.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/logger/logger.js");
const controller_1 = require("../src/actions/controller");
const base_bas_api_1 = require("../src/public-api/base-bas-api");
describe("api unit test", () => {
    let sandbox;
    let extensionsMock;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        extensionsMock = sandbox.mock(testVscode.extensions);
    });
    afterEach(() => {
        extensionsMock.verify();
    });
    it("active extension exports are resolved", async () => {
        const extension = {
            isActive: true,
            exports: "api",
        };
        extensionsMock
            .expects("getExtension")
            .withExactArgs("myExt")
            .returns(extension);
        const result = await base_bas_api_1.baseBasToolkitAPI.getExtensionAPI("myExt");
        (0, chai_1.expect)(result).to.be.equal("api");
    });
    it("get actions - without defined actions", () => {
        const result = base_bas_api_1.baseBasToolkitAPI.getAction("myExt");
        (0, chai_1.expect)(result).to.be.undefined;
    });
    it("get actions - with two actions", () => {
        const action1 = {
            id: "action_1",
            actionType: constants_1.COMMAND,
            name: "name",
        };
        const action2 = {
            id: "action_2",
            actionType: constants_1.SNIPPET,
            context: {},
            contributorId: "contrib1",
            snippetName: "name",
        };
        controller_1.ActionsController["actions"].push(action1);
        controller_1.ActionsController["actions"].push(action2);
        const result = base_bas_api_1.baseBasToolkitAPI.getAction("action_1");
        (0, chai_1.expect)(result).to.includes(action1);
        const result2 = base_bas_api_1.baseBasToolkitAPI.getAction("action_2");
        (0, chai_1.expect)(result2).to.includes(action2);
    });
    it("loadActions", () => {
        const action = {
            id: "abc123",
            actionType: constants_1.COMMAND,
            name: "name",
        };
        const allExtensioms = [
            {
                packageJSON: {
                    BASContributes: {
                        actions: [action],
                    },
                },
            },
        ];
        _.set(testVscode, "extensions.all", allExtensioms);
        controller_1.ActionsController.loadContributedActions();
        const result = base_bas_api_1.baseBasToolkitAPI.getAction("abc123");
        (0, chai_1.expect)(result).to.be.not.undefined;
        (0, chai_1.expect)(result === null || result === void 0 ? void 0 : result.id).to.be.equal(action.id);
        (0, chai_1.expect)(result === null || result === void 0 ? void 0 : result.actionType).to.be.equal(action.actionType);
    });
    it("inactive extension is waited for", async () => {
        const extension = {
            isActive: false,
            exports: "api",
        };
        extensionsMock
            .expects("getExtension")
            .withExactArgs("myExt")
            .returns(extension);
        await (0, chai_1.expect)(promiseWithTimeout(base_bas_api_1.baseBasToolkitAPI.getExtensionAPI("myExt"), 1000)).to.be.rejectedWith("Timed out");
        extension.isActive = true;
    });
    it("non existing extension is rejected", async () => {
        extensionsMock
            .expects("getExtension")
            .withExactArgs("myExt")
            .returns(undefined);
        await (0, chai_1.expect)(base_bas_api_1.baseBasToolkitAPI.getExtensionAPI("myExt")).to.be.rejectedWith(`Extension myExt is not loaded`);
    });
});
function promiseWithTimeout(promise, timeout) {
    return Promise.race([
        promise,
        new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject(new Error("Timed out"));
            }, timeout);
        }),
    ]);
}
//# sourceMappingURL=api.spec.js.map