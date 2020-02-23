import "reflect-metadata";
import { getStore, DEFAULT } from "./binding";
import { StoreLike } from "./types";
import { boundStore, updateStateBindings, unsubscribe, selectionBinding } from "./symbols";

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
       * Update the bound properties and reselect the state.
       */
      public [updateStateBindings]() {
        if (!this[boundStore]) {
          return;
        }
        const boundProperties = [
          ...Object.getOwnPropertyNames(this),
          ...Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        ].filter(property => Boolean(Reflect.getMetadata(selectionBinding, this, property)));
        boundProperties.forEach(property => {
          const config = Reflect.getMetadata(selectionBinding, this, property);
          (this as Record<string, any>)[property] = config.selector(this[boundStore].getState());
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
export const bindSelector = <S, R>(selector: (state: S) => R) => {
  return Reflect.metadata(selectionBinding, { selector });
};

export interface StoreBindingOptions<S> {
  store?: StoreLike<S>;
  scope?: Symbol;
  renderFn?: (me: UnknownInstanceType) => void;
}

type UnsubscribeFunction = () => void;
type UnknownInstanceType = any;
