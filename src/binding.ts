import { enableDomEventForStore, clearDomEventsForStores } from "./integrations";
import { StoreLike } from "./types";

const globalThis = typeof window !== "undefined" ? window : this;

let storeRegistry: Map<Symbol, StoreLike<any>>;
if (Reflect.hasMetadata("storeScopeMap", globalThis)) {
  storeRegistry = Reflect.getMetadata("storeScopeMap", globalThis);
} else {
  storeRegistry = new Map<Symbol, StoreLike<any>>();
  Reflect.defineMetadata("storeScopeMap", storeRegistry, globalThis);
}

export const DEFAULT = Symbol.for("reduxDefaultStoreLike");
/**
 * Register the given Redux StoreLike as the default store that will be used in @useStore decorators by default.
 *
 * @param store
 */
export const registerDefaultStore = <S>(store: StoreLike<S>) => {
  registerStore(DEFAULT, store);
};

/**
 * Register a store under a custom scope that can be later be bound to a component.
 *
 * @param scope     The scope symbol to register the store under
 * @param store     The store to register
 */
export const registerStore = <S>(scope: Symbol, store: StoreLike<S>) => {
  storeRegistry.set(scope, store);
  enableDomEventForStore(store, scope);
};

/**
 * Get a store for a specific scope symbol.
 *
 * @param scope The scope symbol to use for retrieving the store.
 */
export const getStore = <S>(scope: Symbol): StoreLike<S> | undefined => {
  return storeRegistry.get(scope);
};

/**
 * Reset the store registry.
 *
 * Useful for unit tests to clean up.
 */
export const resetStoreRegistry = () => {
  storeRegistry.clear();
  clearDomEventsForStores();
};
