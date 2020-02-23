var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { useStore } from "../decorators";
import { updateStateBindings, boundStore } from "../symbols";
/**
 * Store registration function that works the same like the @useStore decorator, but
 * for libraries like stencil that don't support decorators.
 *
 * @param instance    The instance to register to the store
 */
export const useStoreFor = (instance, options) => {
    let ProxyClass = class ProxyClass {
    };
    ProxyClass = __decorate([
        useStore(options)
    ], ProxyClass);
    const proxy = new ProxyClass();
    proxy[updateStateBindings] = proxy[updateStateBindings].bind(instance);
    instance[boundStore] = proxy[boundStore];
    if (proxy[boundStore]) {
        proxy[updateStateBindings]();
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
