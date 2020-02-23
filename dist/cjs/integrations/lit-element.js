"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Enable LitElement support, e.g. performUpdate after store changes.
 *
 * @param el: the element that will be updated.
 */
function LIT_ELEMENT(el) {
    el.performUpdate();
}
exports.LIT_ELEMENT = LIT_ELEMENT;
