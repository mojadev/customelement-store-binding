"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const binding_1 = require("./binding");
const symbols_1 = require("./symbols");
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
exports.useStore = (options) => {
    const validOptions = options || {};
    return function classDecorator(constructor) {
        var _a;
        return class extends constructor {
            /**
             * The subscription to the store happens in the constructor, so the class is initialized.
             *
             * This happens *after* the initial constructor is called, so
             * @param args
             */
            constructor(...args) {
                super(args);
                this[_a] = () => { };
                this[symbols_1.setupDispatcher]();
                if (validOptions.scope) {
                    this[symbols_1.boundStore] = binding_1.getStore(validOptions.scope) || this[symbols_1.boundStore];
                }
                else if (validOptions.store) {
                    this[symbols_1.boundStore] = validOptions.store;
                }
                else {
                    this[symbols_1.boundStore] = binding_1.getStore(binding_1.DEFAULT) || this[symbols_1.boundStore];
                }
                if (!this[symbols_1.boundStore]) {
                    console.log("No store bound, ignoring annotations");
                    return;
                }
                this[symbols_1.updateStateBindings]();
                this[symbols_1.unsubscribe] = this[symbols_1.boundStore].subscribe(() => {
                    this[symbols_1.updateStateBindings]();
                    if (validOptions.renderFn) {
                        validOptions.renderFn(this);
                    }
                });
            }
            /**
             * In order to prevent memory leaks, unsubscribe must be called when
             * a webcomponent is being removed.
             *
             * This is a coupling to the custom elements specification, but somehow
             * this has to be cleaned up.
             */
            disconnectedCallback() {
                this[symbols_1.unsubscribe]();
                if (constructor.prototype.disconnectedCallback) {
                    constructor.prototype.disconnectedCallback.call(this);
                }
            }
            /**
             * Setup dispatcher functions.
             *
             * Harry, you're a magician: This creates and overwrites methods without the control of the user and
             * should therefore be considered magic. That's why it's better to use HTMLElement.dispatchEvent, but
             * for environments like stencil there is no HTMLElement available or derived in the component.
             *
             * @param parentClass The class from which to look for metadata. Overwritten mainly for stencil support
             */
            [(_a = symbols_1.unsubscribe, symbols_1.setupDispatcher)](parentClass = constructor.prototype) {
                const dispatcherProperties = Reflect.getMetadata(symbols_1.dispatcherDecorator, parentClass) || [];
                dispatcherProperties.forEach(({ fn, scope }) => {
                    const htmlElement = this;
                    htmlElement[fn] = (action) => {
                        binding_1.getStore(scope).dispatch(action);
                    };
                });
            }
            /**
             * Update the store bindings using the registered selector for all bindings in this class.
             *
             * @param parentClass The class from which to look for metadata. Overwritten mainly for stencil support
             */
            [symbols_1.updateStateBindings](parentClass = constructor.prototype) {
                if (!this[symbols_1.boundStore]) {
                    return;
                }
                const config = Reflect.getMetadata(symbols_1.selectionBinding, parentClass) || [];
                config.forEach((binding) => {
                    this[binding.property] = binding.selector(this[symbols_1.boundStore].getState());
                });
            }
        };
    };
};
/**
 * Use this property as a dispatcher that allows submtiting DOM Events.
 *
 * You should only need this for Stencil - in normal HTMLElement derived classes you
 * should simply use this.dipsatchEvent(storeAction(myACtion))
 *
 * @param scope The scope to use, if given not DEFAULT is set
 */
exports.dispatcher = (scope = binding_1.DEFAULT) => {
    return function (target, propertyKey) {
        const keys = Reflect.getMetadata(symbols_1.dispatcherDecorator, target) || [];
        Reflect.defineMetadata(symbols_1.dispatcherDecorator, [...keys, { fn: propertyKey, scope }], target);
    };
};
/**
 * Bind the attribute value to the given selector, so it will be updated on store updates.
 *
 * @param selector  The selector function that should be called
 */
exports.bindSelector = (selector) => {
    return function (target, propertyKey) {
        const keys = Reflect.getMetadata(symbols_1.selectionBinding, target) || [];
        Reflect.defineMetadata(symbols_1.selectionBinding, [...keys, { property: propertyKey, selector }], target);
    };
};
