import { useStore, StoreBindingOptions } from "../decorators";
import { updateStateBindings, boundStore } from "../symbols";

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
  proxy[updateStateBindings] = proxy[updateStateBindings].bind(instance);
  instance[boundStore] = proxy[boundStore];
  if (proxy[boundStore]) {
    proxy[updateStateBindings]();
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
