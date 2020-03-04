"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../decorators");
const symbols_1 = require("../symbols");
/**
 * Store registration function that works the same like the @useStore decorator, but
 * for libraries like stencil that don't support decorators.
 *
 * @param instance    The instance to register to the store
 */
exports.useStoreFor = (instance, options) => {
    let ProxyClass = class ProxyClass {
    };
    ProxyClass = __decorate([
        decorators_1.useStore(options)
    ], ProxyClass);
    const proxy = new ProxyClass();
    instance[symbols_1.boundStore] = proxy[symbols_1.boundStore];
    // We use the updateStateBindings function from the proxy and wire it to the actual class
    // Whats happening here is the proxy reacting to store changes and calling [updateStateBindings]
    // but this effectively happens for the proxied instance
    instance[symbols_1.updateStateBindings] = proxy[symbols_1.updateStateBindings].bind(instance);
    proxy[symbols_1.updateStateBindings] = () => instance[symbols_1.updateStateBindings].call(instance, instance);
    proxy[symbols_1.setupDispatcher].call(instance, instance);
    if (proxy[symbols_1.boundStore]) {
        instance[symbols_1.updateStateBindings](instance);
    }
    forwardDisconnectedCallback(instance, proxy);
};
function forwardDisconnectedCallback(stencilCmp, proxy) {
    if (stencilCmp.disconnectedCallback) {
        const disconnectedCallback = stencilCmp.disconnectedCallback;
        stencilCmp.disconnectedCallback = () => {
            proxy.disconnectedCallback();
            disconnectedCallback.bind(stencilCmp)();
        };
    }
}
