const GLOBAL_EVENT_NAME = 'dispatchStoreAction';
const eventListeners = [];
/**
 * Enable LitElement support, e.g. performUpdate after store changes.
 *
 * @param el: the element that will be updated.
 */
export function LIT_ELEMENT(el) {
    el.performUpdate();
}
/**
 * Wrap the given action in a CustomEvent that can be dispatched and
 * is supported by the dom support.
 *
 * @example:
 * this.dispatchEvent(storeAction(addTodo('Do something')));
 *
 * @param action Any action that should be dispatched
 */
export const storeAction = (action) => {
    return new CustomEvent(GLOBAL_EVENT_NAME, {
        composed: true,
        bubbles: true,
        detail: action
    });
};
/**
 * Add an event listener to the document that forwards events wrapped with @see storeAction to this store.
 *
 * @param store The store that should be updated on DOM events
 */
export const enableDomEventForStore = (store) => {
    if (typeof document === 'undefined') {
        return;
    }
    eventListeners.push((evt) => {
        store.dispatch(evt.detail);
    });
    document.addEventListener(GLOBAL_EVENT_NAME, eventListeners[eventListeners.length - 1]);
};
/**
 * Clear all store event bindings.
 */
export const clearDomEventsForStores = () => {
    if (typeof document === 'undefined') {
        return;
    }
    eventListeners.forEach(eventListener => document.removeEventListener(GLOBAL_EVENT_NAME, eventListener));
};
