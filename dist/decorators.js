"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const binding_1 = require("./binding");
const selectionBinding = Symbol('selectionBinding');
const updateStateBindings = Symbol('updateStateBindings');
const unsubscribe = Symbol('unsubscribe');
const boundStore = Symbol('boundStore');
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
                if (validOptions.scope) {
                    this[boundStore] = binding_1.getStore(validOptions.scope) || this[boundStore];
                }
                else if (validOptions.store) {
                    this[boundStore] = validOptions.store;
                }
                else {
                    this[boundStore] = binding_1.getStore(binding_1.DEFAULT) || this[boundStore];
                }
                if (!this[boundStore]) {
                    console.log('No store bound, ignoring annotations');
                    return;
                }
                this[updateStateBindings]();
                this[unsubscribe] = this[boundStore].subscribe(() => {
                    this[updateStateBindings]();
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
                this[unsubscribe]();
                if (constructor.prototype.disconnectedCallback) {
                    constructor.prototype.disconnectedCallback.call(this);
                }
            }
            /**
             * Update the bound properties and reselect the state.
             */
            [(_a = unsubscribe, updateStateBindings)]() {
                const boundProperties = Object.getOwnPropertyNames(this).filter(property => Boolean(Reflect.getMetadata(selectionBinding, this, property)));
                boundProperties.forEach(property => {
                    const config = Reflect.getMetadata(selectionBinding, this, property);
                    this[property] = config.selector(this[boundStore].getState());
                });
            }
        };
    };
};
/**
 * Bind the attribute value to the given selector, so it will be updated on store updates.
 *
 * @param selector  The selector function that should be called
 */
exports.bindSelector = (selector) => {
    return Reflect.metadata(selectionBinding, { selector });
};
