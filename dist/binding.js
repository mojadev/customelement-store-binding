import { enableDomEventForStore, clearDomEventsForStores } from './integrations';
const globalThis = typeof window !== 'undefined' ? window : this;
let storeRegistry;
if (Reflect.hasMetadata('storeScopeMap', globalThis)) {
    storeRegistry = Reflect.getMetadata('storeScopeMap', globalThis);
}
else {
    storeRegistry = new Map();
    Reflect.defineMetadata('storeScopeMap', storeRegistry, globalThis);
}
export const DEFAULT = Symbol.for('reduxDefaultStoreLike');
/**
 * Register the given Redux StoreLike as the default store that will be used in @useStore decorators by default.
 *
 * @param store
 */
export const registerDefaultStore = (store) => {
    registerStore(DEFAULT, store);
};
/**
 * Register a store under a custom scope that can be later be bound to a component.
 *
 * @param scope     The scope symbol to register the store under
 * @param store     The store to register
 */
export const registerStore = (scope, store) => {
    storeRegistry.set(scope, store);
    enableDomEventForStore(store);
};
/**
 * Get a store for a specific scope symbol.
 *
 * @param scope The scope symbol to use for retrieving the store.
 */
export const getStore = (scope) => {
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
