import { useStoreFor } from "./constructor";
import { bindSelector, dispatcher } from "../decorators";
import { registerDefaultStore, resetStoreRegistry } from "../binding";
import { MockStore } from "../testing";
import { AnyAction } from "../types";

class StencilComponentMock {
  @bindSelector<TestState, string>(x => x.value)
  public value: string = "not set";

  @dispatcher()
  public dispatcher!: (action: AnyAction) => void;

  public disconnectSpy = jasmine.createSpy("disconnectSpy");

  constructor() {
    useStoreFor(this);
  }

  dispatchEvent(ev: Event) {
    document.dispatchEvent(ev);
  }

  disconnectedCallback = this.disconnectSpy;
}

describe("Stencil Integration", () => {
  let store: MockStore<TestState>;

  beforeEach(() => {
    store = new MockStore<TestState>({ value: "initial" });
    registerDefaultStore(store);
  });

  afterEach(() => resetStoreRegistry());

  it("should allow to bind a stencil component to a store using the constructor binding", () => {
    const component = new StencilComponentMock();

    expect(component.value).toBe("initial");
  });

  it("should update the bound values along with state changes", () => {
    const component = new StencilComponentMock();

    store.updateState({ value: "updated value" });

    expect(component.value).toBe("updated value");
  });

  it("should call the disconnectedCallback and unregister the store subscription", () => {
    const component = new StencilComponentMock();

    store.updateState({ value: "test" });
    component.disconnectedCallback();

    expect(component.disconnectSpy).toHaveBeenCalled();
    expect(store.subscriber.length).toBe(0);
  });

  it("should dispatch an event when the dispatcher is called", () => {
    const component = new StencilComponentMock();

    component.dispatcher({ type: "test" });

    expect(store.dispatched.length).toBe(1);
  });
});

interface TestState {
  value: string;
}
