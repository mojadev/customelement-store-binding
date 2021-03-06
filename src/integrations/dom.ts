import { StoreLike, AnyAction } from "../types";
import { GLOBAL_EVENT_NAME } from "./symbols";
import { DEFAULT } from "../binding";

const eventListeners: EventListener[] = [];

/**
 * Wrap the given action in a CustomEvent that can be dispatched and
 * is supported by the dom support.
 *
 * @example:
 * this.dispatchEvent(storeAction(addTodo('Do something')));
 *
 * @param action Any action that should be dispatched
 */
export const storeAction = (action: AnyAction, scope = DEFAULT) => {
  return new CustomEvent<AnyAction>(GLOBAL_EVENT_NAME, {
    composed: true,
    bubbles: true,
    detail: { ...action, scope }
  });
};

/**
 * Add an event listener to the document that forwards events wrapped with @see storeAction to this store.
 *
 * @param store The store that should be updated on DOM events
 */
export const enableDomEventForStore = <S>(store: StoreLike<S>, scope: Symbol) => {
  if (typeof document === "undefined") {
    return;
  }
  eventListeners.push((evt: Event) => {
    const action: AnyAction = (evt as CustomEvent<AnyAction>).detail;
    if (!action.scope || action.scope === scope) {
      store.dispatch({ ...action, scope: undefined });
    }
  });
  window.addEventListener(GLOBAL_EVENT_NAME, eventListeners[eventListeners.length - 1]);
};

/**
 * Clear all store event bindings.
 */
export const clearDomEventsForStores = () => {
  if (typeof document === "undefined") {
    return;
  }
  eventListeners.forEach(eventListener => window.removeEventListener(GLOBAL_EVENT_NAME, eventListener));
};
