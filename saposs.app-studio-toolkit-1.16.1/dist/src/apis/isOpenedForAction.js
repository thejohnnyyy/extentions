"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOpenedForAction = void 0;
const logger_1 = require("../logger/logger");
const parameters_1 = require("./parameters");
const lodash_1 = require("lodash");
async function isOpenedForAction() {
    const logger = (0, logger_1.getLogger)().getChildLogger({ label: "isOpenedForAction" });
    const pkgActionKey = "pkg-action";
    const pkgActionParam = await (0, parameters_1.getParameter)(pkgActionKey);
    if (pkgActionParam === undefined) {
        logger.trace(`Package action does not exist!`);
        return undefined;
    }
    const pkgActionValues = ["release", "deploy", "remove"];
    if ((0, lodash_1.includes)(pkgActionValues, pkgActionParam)) {
        logger.trace(`Package action exists! The action is: '${pkgActionParam}'`);
        return true;
    }
    logger.trace(`The value '${pkgActionParam}' of pkg-action parameter is invalid!`);
    return false;
}
exports.isOpenedForAction = isOpenedForAction;
//# sourceMappingURL=isOpenedForAction.js.map