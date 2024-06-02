"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const messages_1 = require("../../../src/devspace-manager/common/messages");
const bas_sdk_1 = require("@sap/bas-sdk");
const lodash_1 = require("lodash");
describe("getDevSpaces unit test", () => {
    let devspaceProxy;
    const proxyWindow = {
        showErrorMessage: () => {
            throw new Error("not implemented");
        },
    };
    const proxyDevSpace = {
        devspace: {
            getDevSpaces: () => {
                throw new Error("not implemented");
            },
            DevSpaceStatus: bas_sdk_1.devspace.DevSpaceStatus,
            PackName: bas_sdk_1.devspace.PackName,
        },
    };
    const proxyAuthUtils = {
        getJwt: () => {
            throw new Error(`not implemented`);
        },
    };
    before(() => {
        devspaceProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/devspace", {
            vscode: {
                window: proxyWindow,
                "@noCallThru": true,
            },
            "@sap/bas-sdk": proxyDevSpace,
            "../../authentication/auth-utils": proxyAuthUtils,
        });
    });
    let mockAuthUtils;
    let mockDevspace;
    let mockWindow;
    beforeEach(() => {
        mockAuthUtils = (0, sinon_1.mock)(proxyAuthUtils);
        mockDevspace = (0, sinon_1.mock)(proxyDevSpace.devspace);
        mockWindow = (0, sinon_1.mock)(proxyWindow);
    });
    afterEach(() => {
        mockAuthUtils.verify();
        mockDevspace.verify();
        mockWindow.verify();
    });
    const landscape = `https://my.landscape-1.com`;
    const jwt = `devscape-jwt`;
    const devspaces = [
        {
            devspaceDisplayName: `devspaceDisplayName-1`,
            devspaceOrigin: `devspaceOrigin`,
            pack: `pack-1`,
            packDisplayName: `packDisplayName-1`,
            url: `url`,
            id: `id`,
            optionalExtensions: `optionalExtensions`,
            technicalExtensions: `technicalExtensions`,
            status: `STOPPED`,
        },
        {
            devspaceDisplayName: `devspaceDisplayName-2`,
            devspaceOrigin: `devspaceOrigin`,
            pack: `pack-2`,
            packDisplayName: `packDisplayName-2`,
            url: `url-2`,
            id: `id-2`,
            optionalExtensions: `optionalExtensions`,
            technicalExtensions: `technicalExtensions`,
            status: `RUNNING`,
        },
    ];
    it("getDevSpaces, succedded", async () => {
        mockAuthUtils.expects(`getJwt`).withExactArgs(landscape).resolves(jwt);
        mockDevspace
            .expects(`getDevSpaces`)
            .withExactArgs(landscape, jwt)
            .resolves(devspaces);
        (0, chai_1.expect)(await devspaceProxy.getDevSpaces(landscape)).to.be.deep.equal([
            {
                devspaceDisplayName: devspaces[0].devspaceDisplayName,
                devspaceOrigin: devspaces[0].devspaceOrigin,
                pack: devspaces[0].pack,
                packDisplayName: devspaces[0].packDisplayName,
                url: devspaces[0].url,
                id: devspaces[0].id,
                optionalExtensions: devspaces[0].optionalExtensions,
                technicalExtensions: devspaces[0].technicalExtensions,
                status: bas_sdk_1.devspace.DevSpaceStatus.STOPPED,
            },
            {
                devspaceDisplayName: devspaces[1].devspaceDisplayName,
                devspaceOrigin: devspaces[1].devspaceOrigin,
                pack: devspaces[1].pack,
                packDisplayName: devspaces[1].packDisplayName,
                url: devspaces[1].url,
                id: devspaces[1].id,
                optionalExtensions: devspaces[1].optionalExtensions,
                technicalExtensions: devspaces[1].technicalExtensions,
                status: bas_sdk_1.devspace.DevSpaceStatus.RUNNING,
            },
        ]);
    });
    it("getDevSpaces, pack patch applied succedded", async () => {
        mockAuthUtils.expects(`getJwt`).withExactArgs(landscape).resolves(jwt);
        const cloned = (0, lodash_1.cloneDeep)(devspaces);
        cloned[0].pack = `SAP HANA Public`;
        mockDevspace
            .expects(`getDevSpaces`)
            .withExactArgs(landscape, jwt)
            .resolves(cloned);
        const expected = (await devspaceProxy.getDevSpaces(landscape));
        (0, chai_1.expect)(expected[0].pack).to.be.equal(bas_sdk_1.devspace.PackName.HANA);
    });
    it("getDevSpaces, failed", async () => {
        const err = new Error(`getting jwt error`);
        mockAuthUtils.expects(`getJwt`).withExactArgs(landscape).rejects(err);
        mockWindow
            .expects(`showErrorMessage`)
            .withExactArgs(messages_1.messages.err_get_devspace(err.toString()))
            .resolves();
        (0, chai_1.expect)(await devspaceProxy.getDevSpaces(landscape)).to.be.undefined;
    });
});
//# sourceMappingURL=devspace.spec.js.map