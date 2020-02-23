import { useStore, bindSelector } from "./decorators";
import { Store } from "redux";
import { resetStoreRegistry, registerStore } from "./binding";

let getState = jasmine.createSpy("getState");
let subscribe = jasmine.createSpy("subscribe");

const store = { getState, subscribe } as StoreMock;

@useStore({ store, renderFn: (el: TestClass) => el.render() })
class TestClass {
  @bindSelector<State, string>(x => x.test)
  test: string = "";

  public cleanUpCall = jasmine.createSpy("cleanupCall");
  public render = jasmine.createSpy("render");

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
  });

  it("should register at a store using the @useRedux operator", () => {
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
