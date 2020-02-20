import { StoreLike, AnyAction } from './types';

const GLOBAL_EVENT_NAME = 'dispatchStoreAction';
const eventListeners: EventListener[] = [];

/**
 * Enable LitElement support, e.g. performUpdate after store changes.
 *
 * @param el: the element that will be updated.
 */
export function LIT_ELEMENT(el: LitElementTrait) {
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
export const storeAction = <T>(action: AnyAction) => {
  return new CustomEvent<AnyAction>(GLOBAL_EVENT_NAME, {
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
export const enableDomEventForStore = <S>(store: StoreLike<S>) => {
  if (typeof document === 'undefined') {
    return;
  }
  eventListeners.push((evt: Event) => {
    store.dispatch((evt as CustomEvent<AnyAction>).detail);
  });
  document.addEventListener(
    GLOBAL_EVENT_NAME,
    eventListeners[eventListeners.length - 1]
  );
};

/**
 * Clear all store event bindings.
 */
export const clearDomEventsForStores = () => {
  if (typeof document === 'undefined') {
    return;
  }
  eventListeners.forEach(eventListener =>
    document.removeEventListener(GLOBAL_EVENT_NAME, eventListener)
  );
};

type LitElementTrait = { performUpdate: () => {} } | any;
