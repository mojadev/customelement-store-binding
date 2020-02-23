"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
/**
 * Stencil EventOption creator for dispatching actions to the store.
 */
exports.stencilStoreAction = Object.freeze({
    eventName: symbols_1.GLOBAL_EVENT_NAME,
    bubbles: true,
    composed: true
});
