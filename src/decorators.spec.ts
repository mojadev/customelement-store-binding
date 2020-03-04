import { useStore, bindSelector, dispatcher } from "./decorators";
import { Store, AnyAction, Action } from "redux";
import { resetStoreRegistry, registerStore, DEFAULT } from "./binding";
import { storeAction } from "./integrations";

let getState = jasmine.createSpy("getState");
let subscribe = jasmine.createSpy("subscribe");
let dispatch = jasmine.createSpy("dispatch");

const store = { getState, subscribe, dispatch } as StoreMock;

@useStore({ store, renderFn: (el: TestClass) => el.render() })
class TestClass {
  @bindSelector<State, string>(x => x.test)
  test: string = "";

  @dispatcher()
  private dispatch!: (action: AnyAction) => void;

  public cleanUpCall = jasmine.createSpy("cleanupCall");
  public render = jasmine.createSpy("render");

  dispatchAction(action: AnyAction) {
    this.dispatch(action);
  }

  disconnectedCallback() {
    // this is overwritten to test the cleanup being called together with unsubscribing
    this.cleanUpCall();
  }
}

describe("decorators test", () => {
  let notifySubscriber: Function;
  let unsubscribeCallback: Function;

  beforeEach(() => {
    unsubscribeCallback = jasmine.createSpy("unsubscribe");
    store.subscribe = jasmine.createSpy("subscribe").and.callFake(callback => {
      notifySubscriber = callback;
      return unsubscribeCallback;
    });
    store.getState = jasmine.createSpy("getState");
    store.dispatch = jasmine.createSpy("dispatch");
  });

  it("should register at a store using the @useStore decorator", () => {
    store.getState.and.returnValue({ test: "testValue" });

    const htmlElement = new TestClass();

    expect(htmlElement.test).toBe("testValue");
  });

  it("should select again when the state updates", () => {
    store.getState.and.returnValue({ test: "testValue" });
    const htmlElement = new TestClass();

    store.getState.and.returnValue({ test: "updatedValue" });
    notifySubscriber();

    expect(htmlElement.test).toBe("updatedValue");
  });

  it("should unsubscribe from the store when the node is removed from the DOM to prevent memory leaks", () => {
    store.getState.and.returnValue({ test: "testValue" });
    const htmlElement: CustomHTMLElement = new TestClass();

    htmlElement.disconnectedCallback();

    expect(unsubscribeCallback).toHaveBeenCalled();
  });

  it("should still call user-defined disconnectedCallbacks", () => {
    store.getState.and.returnValue({ test: "testValue" });
    const htmlElement: CustomHTMLElement = new TestClass();

    htmlElement.disconnectedCallback();

    expect(htmlElement.cleanUpCall).toHaveBeenCalled();
  });

  it("should call the render function on updates", () => {
    store.getState.and.returnValue({ test: "updatedValue" });
    const htmlElement: CustomHTMLElement = new TestClass();

    store.getState.and.returnValue({ test: "updatedValue" });
    notifySubscriber();

    expect(htmlElement.render).toHaveBeenCalledTimes(1);
  });

  it("should dispatch an action when a @dispatcher function is called", () => {
    store.getState.and.returnValue({ test: "updatedValue" });
    const htmlElement: CustomHTMLElement = new TestClass();

    htmlElement.dispatchEvent = jasmine.createSpy("dispatchEvent");
    htmlElement.dispatchAction({ type: "action" });

    const spy = htmlElement.dispatchEvent as jasmine.Spy;

    expect(spy).toHaveBeenCalled();
    expect(spy.calls.mostRecent().args[0].detail).toEqual({ type: "action", scope: DEFAULT });
  });

  describe("with scope store reference", () => {
    const scope = Symbol("testScope");

    @useStore({ scope })
    class ScopedStoreRefClass {
      @bindSelector<State, string>(x => x.test)
      public boundValue: string = "init";
    }

    beforeEach(() => resetStoreRegistry());

    it("should use the store registry for decoupled access to the backing store", () => {
      registerStore(scope, store);
      store.getState.and.returnValue({ test: "updatedValue" });

      const htmlElement = new ScopedStoreRefClass();

      expect(htmlElement.boundValue).toBe("updatedValue");
    });

    it("should only react to events fired for the given scope", () => {
      registerStore(scope, store);
      store.getState.and.returnValue({ test: "updatedValue" });

      document.dispatchEvent(storeAction({ type: "ignored" }));
      document.dispatchEvent(storeAction({ type: "accepted" }, scope));

      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith({ type: "accepted", scope });
    });

    // Planned for future release if needed
    xit("should allow to switch the store scope during runtime", () => {
      const secondState = jasmine.createSpy("secondState").and.returnValue({ test: "state2" });
      const secondSubscribe = jasmine.createSpy("secondSubscribe").and.returnValue({ test: "subscribe2" });
      const alternativeStore = {
        getState: secondState,
        subscribe: secondSubscribe
      } as StoreMock;

      registerStore(scope, store);
      store.getState.and.returnValue({ test: "updatedValue" });

      const htmlElement = new ScopedStoreRefClass();
      registerStore(store, alternativeStore);
      secondSubscribe();

      expect(htmlElement.boundValue).toBe("state2");
    });
  });
});

type CustomHTMLElement = any;

interface State {
  test: string;
}
type StoreMock = any | Store;
