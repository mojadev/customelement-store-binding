import { registerDefaultStore, resetStoreRegistry } from "customelement-store-binding";
import { newSpecPage } from "@stencil/core/testing";
import { TodoList } from "./todo-list";
import { configureStore, Store } from "@reduxjs/toolkit";
import { AnyHTMLElement } from "@stencil/core/dist/declarations";
import reducer from "../reducer";

/**
 * This is a spec test using the store for stencil.
 *
 * It's important to put the store initialization between the specPage creation
 * and the await of the returned promise, as otherwise the document will be reassigned
 * and the events won't catch.
 */
describe("App component test", () => {
  let store: Store;

  it("should not display any todos on start", async () => {
    const specPage = await createElement();

    expect(specPage.body.querySelectorAll("li > span").length).toBe(0);
  });

  it("should add a todo when entering a text and clicking on add", async () => {
    const specPage = await createElement();
    const expectedText = "New Todo";

    enterTodoText(specPage.body, expectedText);
    clickAddButton(specPage.body);

    await specPage.waitForChanges();

    const todoItem = specPage.body.querySelector(".todo-item") as HTMLElement;
    expect(todoItem).not.toBeNull();
    expect(todoItem?.innerText.trim()).toMatch(expectedText);
  });

  it("should dispatch a finish action when clicking on the todo done button", async () => {
    const specPage = await createElement();
    const expectedText = "New Todo";

    enterTodoText(specPage.body, expectedText);
    clickAddButton(specPage.body);

    await specPage.waitForChanges();
    const todoItem = specPage.body.querySelector(".todo-item") as HTMLElement;
    clickFinishButton(todoItem);

    expect(todoItem).not.toBeNull();
    expect(todoItem?.innerText.trim()).toMatch(expectedText);
  });

  afterEach(() => {
    // Clean up the stores
    resetStoreRegistry();
  });

  async function createElement() {
    const specPage = newSpecPage({
      components: [TodoList],
      html: "<todo-list></todo-list>"
    });
    // It's important to do this before awaiting the specPage
    store = configureStore({ reducer });
    registerDefaultStore(store);
    return await specPage;
  }

  function clickFinishButton(root: AnyHTMLElement) {
    const button = root.querySelector(`.todo__finish-btn`) as HTMLButtonElement;
    button.click();
  }

  function clickAddButton(root: AnyHTMLElement) {
    const button = root.querySelector(".todo__add-btn") as HTMLButtonElement;
    button.click();
  }

  function enterTodoText(root: AnyHTMLElement, text: string) {
    const textInput = root.querySelector(".todo__text-input") as HTMLInputElement;
    textInput.value = text;
    textInput.dispatchEvent(new Event("change"));
  }
});
