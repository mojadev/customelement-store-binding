import { StoreLike, AnyAction } from './types';
/**
 * Enable LitElement support, e.g. performUpdate after store changes.
 *
 * @param el: the element that will be updated.
 */
export declare function LIT_ELEMENT(el: LitElementTrait): void;
/**
 * Wrap the given action in a CustomEvent that can be dispatched and
 * is supported by the dom support.
 *
 * @example:
 * this.dispatchEvent(storeAction(addTodo('Do something')));
 *
 * @param action Any action that should be dispatched
 */
export declare const storeAction: <T>(action: AnyAction) => CustomEvent<AnyAction>;
/**
 * Add an event listener to the document that forwards events wrapped with @see storeAction to this store.
 *
 * @param store The store that should be updated on DOM events
 */
export declare const enableDomEventForStore: <S>(store: StoreLike<S>) => void;
/**
 * Clear all store event bindings.
 */
export declare const clearDomEventsForStores: () => void;
declare type LitElementTrait = {
    performUpdate: () => {};
} | any;
export {};