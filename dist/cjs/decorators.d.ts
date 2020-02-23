import "reflect-metadata";
import { StoreLike } from "./types";
import { boundStore, updateStateBindings, unsubscribe } from "./symbols";
/**
 * Subscribe this component to the given store.
 *
 * if no options are given, the store registered with {@see registerDefaultStore } will be used.
 *
 * @param options  Setup options for the store:
 * - store (optional)       An explicit store that should be used
 * - scope (optional)       The scope symbol under which the store can be found
 * - renderFn (optional)    The function that should be called to trigger rendering.
 */
export declare const useStore: <S>(options?: StoreBindingOptions<S> | undefined) => <T extends new (...args: any[]) => {}>(constructor: T) => {
    new (...args: any[]): {
        /**
         * In order to prevent memory leaks, unsubscribe must be called when
         * a webcomponent is being removed.
         *
         * This is a coupling to the custom elements specification, but somehow
         * this has to be cleaned up.
         */
        disconnectedCallback(): void;
        [unsubscribe]: UnsubscribeFunction;
        [boundStore]: StoreLike<S>;
        /**
         * Update the bound properties and reselect the state.
         */
        [updateStateBindings](): void;
    };
} & T;
/**
 * Bind the attribute value to the given selector, so it will be updated on store updates.
 *
 * @param selector  The selector function that should be called
 */
export declare const bindSelector: <S, R>(selector: (state: S) => R) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export interface StoreBindingOptions<S> {
    store?: StoreLike<S>;
    scope?: Symbol;
    renderFn?: (me: UnknownInstanceType) => void;
}
declare type UnsubscribeFunction = () => void;
declare type UnknownInstanceType = any;
export {};
