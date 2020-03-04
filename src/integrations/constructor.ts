import { useStore, StoreBindingOptions } from "../decorators";
import { setupDispatcher, updateStateBindings, boundStore } from "../symbols";

/**
 * Store registration function that works the same like the @useStore decorator, but
 * for libraries like stencil that don't support decorators.
 *
 * @param instance    The instance to register to the store
 */
export const useStoreFor = <S>(instance: any, options?: StoreBindingOptions<S>) => {
  @useStore(options)
  class ProxyClass {
    [updateStateBindings]: () => {};
  }

  const proxy = new ProxyClass() as any;
  instance[boundStore] = proxy[boundStore];

  // We use the updateStateBindings function from the proxy and wire it to the actual class
  // Whats happening here is the proxy reacting to store changes and calling [updateStateBindings]
  // but this effectively happens for the proxied instance
  instance[updateStateBindings] = proxy[updateStateBindings].bind(instance);
  proxy[updateStateBindings] = () => instance[updateStateBindings].call(instance, instance);

  proxy[setupDispatcher].call(instance, instance);
  if (proxy[boundStore]) {
    instance[updateStateBindings](instance);
  }
  forwardDisconnectedCallback(instance, proxy);
};

function forwardDisconnectedCallback(stencilCmp: any, proxy: any) {
  if (stencilCmp.disconnectedCallback) {
    const disconnectedCallback = stencilCmp.disconnectedCallback;
    stencilCmp.disconnectedCallback = () => {
      proxy.disconnectedCallback();
      disconnectedCallback.bind(stencilCmp)();
    };
  }
}
