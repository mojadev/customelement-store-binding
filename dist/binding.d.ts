import { StoreLike } from './types';
export declare const DEFAULT: unique symbol;
/**
 * Register the given Redux StoreLike as the default store that will be used in @useStore decorators by default.
 *
 * @param store
 */
export declare const registerDefaultStore: <S>(store: StoreLike<S>) => void;
/**
 * Register a store under a custom scope that can be later be bound to a component.
 *
 * @param scope     The scope symbol to register the store under
 * @param store     The store to register
 */
export declare const registerStore: <S>(scope: Symbol, store: StoreLike<S>) => void;
/**
 * Get a store for a specific scope symbol.
 *
 * @param scope The scope symbol to use for retrieving the store.
 */
export declare const getStore: <S>(scope: Symbol) => StoreLike<S> | undefined;
/**
 * Reset the store registry.
 *
 * Useful for unit tests to clean up.
 */
export declare const resetStoreRegistry: () => void;
