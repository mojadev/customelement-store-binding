/**
 * Enable LitElement support, e.g. performUpdate after store changes.
 *
 * @param el: the element that will be updated.
 */
export declare function LIT_ELEMENT(el: LitElementTrait): void;
declare type LitElementTrait = {
    performUpdate: () => {};
} | any;
export {};
