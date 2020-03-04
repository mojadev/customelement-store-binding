import "reflect-metadata";
import { StoreLike } from "./types";
import { boundStore, updateStateBindings, unsubscribe, setupDispatcher } from "./symbols";
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
         * Setup dispatcher functions.
         *
         * Harry, you're a magician: This creates and overwrites methods without the control of the user and
         * should therefore be considered magic. That's why it's better to use HTMLElement.dispatchEvent, but
         * for environments like stencil there is no HTMLElement available or derived in the component.
         *
         * @param parentClass The class from which to look for metadata. Overwritten mainly for stencil support
         */
        [setupDispatcher](parentClass?: any): void;
        /**
         * Update the store bindings using the registered selector for all bindings in this class.
         *
         * @param parentClass The class from which to look for metadata. Overwritten mainly for stencil support
         */
        [updateStateBindings](parentClass?: any): void;
    };
} & T;
/**
 * Use this property as a dispatcher that allows submtiting DOM Events.
 *
 * You should only need this for Stencil - in normal HTMLElement derived classes you
 * should simply use this.dipsatchEvent(storeAction(myACtion))
 *
 * @param scope The scope to use, if given not DEFAULT is set
 */
export declare const dispatcher: (scope?: symbol) => (target: any, propertyKey: string) => void;
/**
 * Bind the attribute value to the given selector, so it will be updated on store updates.
 *
 * @param selector  The selector function that should be called
 */
export declare const bindSelector: <S, R>(selector: (state: S) => R) => (target: any, propertyKey: string) => void;
export interface StoreBindingOptions<S> {
    store?: StoreLike<S>;
    scope?: Symbol;
    renderFn?: (me: UnknownInstanceType) => void;
}
declare type UnsubscribeFunction = () => void;
declare type UnknownInstanceType = any;
export {};
