"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdDevSpaceAdd = void 0;
const landscape_1 = require("../landscape/landscape");
async function cmdDevSpaceAdd(landscape) {
    // dummy async delay until a real implementation will created
    await new Promise((resolve, reject) => setTimeout(() => resolve(true), 100));
    (0, landscape_1.autoRefresh)();
}
exports.cmdDevSpaceAdd = cmdDevSpaceAdd;
//# sourceMappingURL=add.js.map