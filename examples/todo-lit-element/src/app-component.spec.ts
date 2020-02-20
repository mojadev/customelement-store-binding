import { MockStore, registerDefaultStore, resetStoreRegistry } from "customelement-store-binding";

import { AppRootState } from "./reducer";
import { TodoListElement } from "./app-component";

/**
 * Unit tests for the app component.
 *
 * Notice how these tests uses the MockStore to prepare and modify the state directly
 * and how only actions being dispatched are observerved.
 *
 * This is great when writing components without actually having a working reducer logic or when
 * your reducer logic would contain many calls to other systems/modules you would have to mock.
 *
 * If this is not the case, take a look at the withStore.spec.ts which shows how to do a more behaviour
 * centric, integration-test like approach using a real store as the backend.
 */
describe("App component test", () => {
  let store: MockStore<AppRootState>;
  let container: HTMLElement;

  beforeEach(() => {
    store = new MockStore<AppRootState>({ todos: [] });
    registerDefaultStore(store);

    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should not display any todos on start", async () => {
    const el = await createElement();

    const root = el.shadowRoot;
    expect(root?.querySelectorAll("li").length).toBe(0);
  });

  it("should add a todo when entering a text and clicking on add", async () => {
    const expectedText = "New Todo";
    const root = (await createElement()).shadowRoot as ShadowRoot;
    const eventSpy = jasmine.createSpy("storeCalled");

    enterTodoText(root, expectedText);
    document.addEventListener("dispatchStoreAction", eventSpy, { once: true });
    clickAddButton(root);

    expect(eventSpy.calls.mostRecent().args[0].detail).toEqual({
      type: "todo-store/addTodo",
      payload: { title: expectedText }
    });
  });

  it("should display all todos from the store is updated", async () => {
    const root = (await createElement()).shadowRoot as ShadowRoot;
    store.updateState({ todos: [{ id: "1234", title: "hello", done: false }] });

    expect(root?.querySelectorAll("li").length).toBe(1);
  });

  it("should dispatch a finish action when clicking on the todo done button", async () => {
    const root = (await createElement()).shadowRoot as ShadowRoot;
    const eventSpy = jasmine.createSpy("storeCalled");
    store.updateState({ todos: [{ id: "1234", title: "hello", done: false }] });

    document.addEventListener("dispatchStoreAction", eventSpy, { once: true });
    clickFinishButton(root, "1234");

    expect(eventSpy.calls.mostRecent().args[0].detail).toEqual({
      type: "todo-store/finishTodo",
      payload: "1234"
    });
  });

  const tick = async () => await Promise.resolve();

  afterEach(() => {
    // Clean up the stores
    resetStoreRegistry();
    document.body.removeChild(container);
  });

  async function createElement() {
    const el = document.createElement("todo-list") as TodoListElement;
    container.appendChild(el);
    await tick();
    return el;
  }

  function clickFinishButton(root: ShadowRoot, todoId: string) {
    const button = root.querySelector(`#finish-${todoId}`) as HTMLButtonElement;
    button.click();
  }

  function clickAddButton(root: ShadowRoot) {
    const button = root.querySelector(".todo__add-btn") as HTMLButtonElement;
    button.click();
  }

  function enterTodoText(root: ShadowRoot, text: string) {
    const textInput = root.querySelector(".todo__text-input") as HTMLInputElement;
    textInput.value = text;
    textInput.dispatchEvent(new Event("change"));
  }
});
