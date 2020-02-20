import { registerDefaultStore, resetStoreRegistry } from "customelement-store-binding";

import { TodoListElement } from "./app-component";
import todos from "./reducer";
import { configureStore } from "@reduxjs/toolkit";

/**
 * This is the same test like app-component.spec.ts but in more integrative fashion:
 * Instead of modifying the underlying store and observing emitted actions the actual behaviour is tested.
 *
 * This means the reducers are also called and the store must be setup with the correct subset of reducers.
 * Is it better? Depends on how you like to test - fact is, this is actual behaviour and quite close to the
 * way a user will encounter your component, which is generally a good thing.
 *
 * The downside is of course that changes in your store might lead to changes in your test, as this is not as
 * isolated as the the more unit test-ish version in app-component.spec.ts.
 */
describe("App component test using actual store", () => {
  let container: HTMLElement;

  beforeEach(() => {
    // use the actual store
    registerDefaultStore(configureStore({ reducer: todos }));

    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should not display any todos on start", async () => {
    const el = await createElement();

    const root = el.shadowRoot;
    expect(root?.querySelectorAll("li > span").length).toBe(0);
  });

  it("should add a todo when entering a text and clicking on add", async () => {
    const expectedText = "New Todo";
    const root = (await createElement()).shadowRoot as ShadowRoot;

    enterTodoText(root, expectedText);
    clickAddButton(root);
    await tick();

    const todoItems = root?.querySelectorAll("li > span") as NodeListOf<HTMLSpanElement>;
    expect(todoItems.length).toBe(1);
    expect(todoItems[0].innerText.trim()).toMatch(expectedText);
  });

  it("should dispatch a finish action when clicking on the todo done button", async () => {
    const root = (await createElement()).shadowRoot as ShadowRoot;

    enterTodoText(root, "Todo1");
    clickAddButton(root);
    await tick();

    const todoItem = root.querySelector("li") as HTMLLIElement;
    clickFinishButton(todoItem);

    expect(todoItem.innerText.trim()).toMatch(/. Todo1.*/);
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

  function clickFinishButton(root: HTMLLIElement) {
    const button = root.querySelector(`.todo__finish-btn`) as HTMLButtonElement;
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
