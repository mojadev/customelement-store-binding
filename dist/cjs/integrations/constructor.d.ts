import { StoreBindingOptions } from "../decorators";
/**
 * Store registration function that works the same like the @useStore decorator, but
 * for libraries like stencil that don't support decorators.
 *
 * @param instance    The instance to register to the store
 */
export declare const useStoreFor: <S>(instance: any, options?: StoreBindingOptions<S> | undefined) => void;
