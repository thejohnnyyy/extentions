"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mockUtil_1 = require("../mockUtil");
const sinon_1 = require("sinon");
const extensions = { getExtension: () => undefined };
const testVscode = {
    extensions,
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/logger/logger.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/apis/validateLCAP.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/apis/validateFioriCapabilities.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/apis/validateCapCapabilities.js");
const validateLCAP_1 = require("../../src/apis/validateLCAP");
const validateFioriCapabilities_1 = require("../../src/apis/validateFioriCapabilities");
const validateCapCapabilities_1 = require("../../src/apis/validateCapCapabilities");
describe("validate capabilities API", () => {
    it("should return false", async () => {
        const parameterValue = await (0, validateLCAP_1.isLCAPEnabled)();
        (0, chai_1.expect)(parameterValue).to.be.false;
    });
    describe("validate returned value according to the extension existence", () => {
        let extensionsMock;
        let sandbox;
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
        it("should return false when LCAP extension does not exist", async () => {
            extensionsMock
                .expects("getExtension")
                .withExactArgs(validateLCAP_1.LACP_EXTENSION_ID)
                .returns(undefined);
            const parameterValue = await (0, validateLCAP_1.isLCAPEnabled)();
            (0, chai_1.expect)(parameterValue).to.be.false;
        });
        it("should return true when LCAP extension exists", async () => {
            const extension = { id: validateLCAP_1.LACP_EXTENSION_ID };
            extensionsMock
                .expects("getExtension")
                .withExactArgs(validateLCAP_1.LACP_EXTENSION_ID)
                .returns(extension);
            const parameterValue = await (0, validateLCAP_1.isLCAPEnabled)();
            (0, chai_1.expect)(parameterValue).to.be.true;
        });
        it("should return false when Fiori extension does not exist", async () => {
            extensionsMock
                .expects("getExtension")
                .withExactArgs(validateFioriCapabilities_1.FIORI_EXTENSION_ID)
                .returns(undefined);
            const parameterValue = await (0, validateFioriCapabilities_1.hasFioriCapabilities)();
            (0, chai_1.expect)(parameterValue).to.be.false;
        });
        it("should return true when Fiori extension exists", async () => {
            const extension = { id: validateFioriCapabilities_1.FIORI_EXTENSION_ID };
            extensionsMock
                .expects("getExtension")
                .withExactArgs(validateFioriCapabilities_1.FIORI_EXTENSION_ID)
                .returns(extension);
            const parameterValue = await (0, validateFioriCapabilities_1.hasFioriCapabilities)();
            (0, chai_1.expect)(parameterValue).to.be.true;
        });
        it("should return false when Cap extension does not exist", async () => {
            extensionsMock
                .expects("getExtension")
                .withExactArgs(validateCapCapabilities_1.CAP_EXTENSION_ID)
                .returns(undefined);
            const parameterValue = await (0, validateCapCapabilities_1.hasCapCapabilities)();
            (0, chai_1.expect)(parameterValue).to.be.false;
        });
        it("should return true when Cap extension exists", async () => {
            const extension = { id: validateCapCapabilities_1.CAP_EXTENSION_ID };
            extensionsMock
                .expects("getExtension")
                .withExactArgs(validateCapCapabilities_1.CAP_EXTENSION_ID)
                .returns(extension);
            const parameterValue = await (0, validateCapCapabilities_1.hasCapCapabilities)();
            (0, chai_1.expect)(parameterValue).to.be.true;
        });
    });
});
//# sourceMappingURL=validateCapabilities.spec.js.map