import { GLOBAL_EVENT_NAME } from "./symbols";

/**
 * Stencil EventOption creator for dispatching actions to the store.
 */
export const stencilStoreAction = Object.freeze({
  eventName: GLOBAL_EVENT_NAME,
  bubbles: true,
  composed: true
});
