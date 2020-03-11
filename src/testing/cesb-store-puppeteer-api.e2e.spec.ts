import puppeteer, { Browser, ElementHandle } from "puppeteer";
import express from "express";
import { enableCesbSupport } from "./cesb-store-puppeteer-api";

const port = 14200;

describe("CESB puppeteer api (e2e)", () => {
  let browser: Browser;
  let listener: any;

  beforeAll(async () => {
    const browserPromise = puppeteer.launch();
    const server = express();
    server.use(express.static("./e2e"));
    listener = server.listen(port);
    browser = await browserPromise;
  });

  it("should allow to connect to a bound store of a component", async () => {
    const { page, todoListCmp } = await openPage(browser);

    const api = await enableCesbSupport(page);
    const store = await api.connect(todoListCmp);

    expect(store).toBeDefined();
  });

  it("should allow to inspect the state of the component store", async () => {
    const { page, todoListCmp } = await openPage(browser);

    const api = await enableCesbSupport(page);
    const store = await api.connect(todoListCmp);
    await todoListCmp.evaluate(cmp => {
      (cmp.shadowRoot!.querySelector(".todo__add-btn") as HTMLButtonElement).click();
    });

    expect(store.getState()).toBeDefined();
    expect(store.getState().todos.length).toBe(1);
  });

  it("should allow to get a snapshot of dispatched actions", async () => {
    const { page, todoListCmp } = await openPage(browser);

    const api = await enableCesbSupport(page);
    const store = await api.connect(todoListCmp);
    await todoListCmp.evaluate(cmp => (cmp.shadowRoot!.querySelector(".todo__add-btn") as HTMLButtonElement).click());

    expect(store.getDispatchedActions()).toEqual([{ payload: { title: "" }, type: "todo-store/addTodo" }]);
  });

  it("should allow to dispatch actions to the store", async () => {
    const { page, todoListCmp } = await openPage(browser);

    const api = await enableCesbSupport(page);
    const store = await api.connect(todoListCmp);
    await store.dispatchAction({ type: "todo-store/addTodo", payload: { title: "A new task" } });

    const html = await todoListCmp.evaluate(cmp => cmp.shadowRoot!.innerHTML);
    expect(html).toContain("A new task");
  });

  afterAll(async () => {
    await new Promise(resolve => listener.close(resolve));
    await browser.close();
  });
});

async function openPage(browser: puppeteer.Browser) {
  const page = await browser.newPage();
  await page.goto("http://localhost:14200/index.html");
  const todoListCmp = (await page.$("todo-list")) as ElementHandle;
  return { page, todoListCmp };
}
