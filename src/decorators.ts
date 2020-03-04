import "reflect-metadata";
import { getStore, DEFAULT } from "./binding";
import { StoreLike } from "./types";
import { boundStore, updateStateBindings, unsubscribe, selectionBinding, dispatcherDecorator, setupDispatcher } from "./symbols";
import { AnyAction } from "redux";
import { storeAction } from "./integrations";

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
export const useStore = <S>(options?: StoreBindingOptions<S>) => {
  const validOptions = options || {};
  return function classDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      public [unsubscribe]: UnsubscribeFunction = () => {};
      public [boundStore]: StoreLike<S>;

      /**
       * The subscription to the store happens in the constructor, so the class is initialized.
       *
       * This happens *after* the initial constructor is called, so
       * @param args
       */
      constructor(...args: any[]) {
        super(args);

        this[setupDispatcher]();

        if (validOptions.scope) {
          this[boundStore] = getStore(validOptions.scope) || this[boundStore];
        } else if (validOptions.store) {
          this[boundStore] = validOptions.store;
        } else {
          this[boundStore] = getStore(DEFAULT) || this[boundStore];
        }
        if (!this[boundStore]) {
          console.log("No store bound, ignoring annotations");
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
       * Setup dispatcher functions.
       *
       * Harry, you're a magician: This creates and overwrites methods without the control of the user and
       * should therefore be considered magic. That's why it's better to use HTMLElement.dispatchEvent, but
       * for environments like stencil there is no HTMLElement available or derived in the component.
       *
       * @param parentClass The class from which to look for metadata. Overwritten mainly for stencil support
       */
      public [setupDispatcher](parentClass = constructor.prototype) {
        const dispatcherProperties = Reflect.getMetadata(dispatcherDecorator, parentClass) || [];
        dispatcherProperties.forEach(({ fn, scope }: { fn: string; scope: symbol }) => {
          const htmlElement = this as any;
          htmlElement[fn] = (action: AnyAction) => {
            if (getStore(scope)) {
              getStore(scope)!.dispatch(action);
            } else {
              (this as any).dispatchEvent(storeAction(action, scope));
            }
          };
        });
      }

      /**
       * Update the store bindings using the registered selector for all bindings in this class.
       *
       * @param parentClass The class from which to look for metadata. Overwritten mainly for stencil support
       */
      public [updateStateBindings](parentClass = constructor.prototype) {
        if (!this[boundStore]) {
          return;
        }
        const config = Reflect.getMetadata(selectionBinding, parentClass) || [];
        config.forEach((binding: { property: string; selector: any }) => {
          (this as Record<string, any>)[binding.property] = binding.selector(this[boundStore].getState());
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
export const dispatcher = (scope = DEFAULT) => {
  return function(target: any, propertyKey: string) {
    const keys = Reflect.getMetadata(dispatcherDecorator, target) || [];
    Reflect.defineMetadata(dispatcherDecorator, [...keys, { fn: propertyKey, scope }], target);
  };
};
/**
 * Bind the attribute value to the given selector, so it will be updated on store updates.
 *
 * @param selector  The selector function that should be called
 */
export const bindSelector = <S, R>(selector: (state: S) => R) => {
  return function(target: any, propertyKey: string) {
    const keys = Reflect.getMetadata(selectionBinding, target) || [];
    Reflect.defineMetadata(selectionBinding, [...keys, { property: propertyKey, selector }], target);
  };
};

export interface StoreBindingOptions<S> {
  store?: StoreLike<S>;
  scope?: Symbol;
  renderFn?: (me: UnknownInstanceType) => void;
}

type UnsubscribeFunction = () => void;
type UnknownInstanceType = any;
