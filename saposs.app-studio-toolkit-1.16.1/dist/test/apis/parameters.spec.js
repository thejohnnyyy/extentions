"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const proxyquire_1 = __importDefault(require("proxyquire"));
const wrapper_1 = require("@vscode-logging/wrapper");
describe("the getParameters utility", () => {
    function buildGetParamProxy(optionalRequireMock) {
        const proxiedModule = (0, proxyquire_1.default)("../../src/apis/parameters", {
            "../utils/optional-require": {
                optionalRequire() {
                    return optionalRequireMock;
                },
            },
            "../logger/logger": { getLogger: () => wrapper_1.NOOP_LOGGER },
        });
        return proxiedModule.getParameter;
    }
    describe("when @sap/plugin is found", () => {
        let getParameterProxy;
        before(() => {
            const sapPlugin = {
                window: {
                    configuration: () => ({ ima_aba: "bamba" }),
                },
            };
            getParameterProxy = buildGetParamProxy(sapPlugin);
        });
        it("returns its `window.configuration()` ", async () => {
            await (0, chai_1.expect)(getParameterProxy("ima_aba")).to.eventually.equal("bamba");
        });
    });
    describe("when @sap/plugin is not found", () => {
        let getParameterProxy;
        before(() => {
            getParameterProxy = buildGetParamProxy(null);
        });
        it("returns undefined` ", async () => {
            await (0, chai_1.expect)(getParameterProxy("actions")).to.eventually.be.undefined;
        });
    });
    describe("when @sap/plugin has an invalid configuration() value", () => {
        let getParameterProxy;
        before(() => {
            const sapPlugin = {
                window: {
                    configuration: () => undefined,
                },
            };
            getParameterProxy = buildGetParamProxy(sapPlugin);
        });
        it("returns", async () => {
            await (0, chai_1.expect)(getParameterProxy("foo")).to.eventually.be.undefined;
        });
    });
    describe("when @sap/plugin['configuration'] lacks the requested parameters", () => {
        let getParameterProxy;
        before(() => {
            const sapPlugin = {
                window: {
                    configuration: () => ({ foo: "666" }),
                },
            };
            getParameterProxy = buildGetParamProxy(sapPlugin);
        });
        it("returns", async () => {
            await (0, chai_1.expect)(getParameterProxy("bar")).to.eventually.be.undefined;
        });
    });
});
//# sourceMappingURL=parameters.spec.js.map