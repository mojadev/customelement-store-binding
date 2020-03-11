import { Page, Request, ElementHandle } from "puppeteer";
import { AnyAction, StoreLike } from "../types";

/**
 * This is a simple, rudimentary channel/observable implementation
 * that provides just enough functionality to have one consumer subscribe
 * to changes.
 */
class Channel<S> {
  private buffer: S[] = [];
  private subscriber?: (el: S) => void;

  public subscribe(target: (value: S) => void) {
    if (this.buffer.length) {
      target(this.buffer[0]);
      this.buffer = this.buffer.filter((_, idx) => idx > 0);
    } else {
      this.subscriber = target;
    }
  }

  public submit(value: S) {
    if (this.subscriber) {
      this.subscriber(value);
    } else {
      this.buffer.push(value);
    }
  }
}

/**
 * Enable customelement-store-binding inspection support for this page.
 *
 * @param page  The @see Page that should allow inspection of cesb elements
 */
export async function enableCesbSupport(page: Page): Promise<CesbPuppeteerApi> {
  await page.setRequestInterception(true);

  /**
   * Connect the puppeteer @see ElementHandle to the cesb store.
   *
   * @param el  A puppeteer @see ElementHandle that should be a component with a bound store.
   */
  const connect = async (el: ElementHandle): Promise<CesbComponent> => {
    const channel = new Channel<StoreCommand>();

    setupHttpBridge(page, channel);
    injectIntoCustomElement(el);

    let state = {};
    let actions: AnyAction[] = [];

    channel.subscribe((command: StoreCommand) => {
      switch (command.type) {
        case "action":
          actions.push(command.payload);
          break;
        case "state":
          state = command.payload;
          break;
      }
    });
    return {
      getState: () => state,
      getDispatchedActions: () => actions,
      dispatchAction: createDispatchActionHandler(el)
    } as CesbComponent;
  };

  return {
    connect
  };
}

export interface CesbPuppeteerApi {
  connect(el: ElementHandle): Promise<CesbComponent>;
}

export interface CesbComponent {
  getState(): any;
  getDispatchedActions(): AnyAction[];
  dispatchAction(action: AnyAction): Promise<void>;
}

/**
 * This interceptor allows the cesb component to push changes and information
 * to the node runner without injecting custom libraries into the puppeteer page.
 */
function setupHttpBridge(page: Page, channel: Channel<StoreCommand>) {
  page.on("request", (request: Request) => {
    if (!request.url().endsWith("/cesb-store")) {
      request.continue();
    }
    channel.submit(JSON.parse(request.postData() || ""));
    request.abort();
  });
}

/**
 * Return a function that allows to dispatch an @see AnyAction into the elements bound store.
 *
 * @param el The @see ElementHandle whose store should be used.
 */
function createDispatchActionHandler(el: ElementHandle<Element>) {
  return async (action: AnyAction) => {
    await el.evaluate((el, storeAction) => {
      const storeSymbol = Object.getOwnPropertySymbols(el).find(x => /boundStore/.test(String(x)));
      if (!storeSymbol) {
        throw Error("No bound store for on element " + el);
      }
      const store = (el as any)[storeSymbol] as StoreLike<any>;
      store.dispatch(storeAction);
    }, action);
  };
}

/**
 * Inject into the customElements bound store and setup http calls for important events.
 * @param el
 */
function injectIntoCustomElement(el: ElementHandle<Element>) {
  el.evaluateHandle(el => {
    const storeSymbol = Object.getOwnPropertySymbols(el).find(x => /boundStore/.test(String(x)));
    if (!storeSymbol) {
      throw Error("No bound store for on element " + el);
    }
    const store = (el as any)[storeSymbol] as StoreLike<any>;
    const __dispatchAcion = store.dispatch;
    const provideStore = () =>
      fetch("/cesb-store", {
        method: "POST",
        body: JSON.stringify({ type: "state", payload: store.getState() })
      });
    store.dispatch = (action: AnyAction) => {
      __dispatchAcion(action);
      fetch("/cesb-store", {
        method: "POST",
        body: JSON.stringify({ type: "action", payload: action })
      });
    };
    store.subscribe(provideStore);
    provideStore();
  });
}

interface StoreCommand {
  type: "action" | "state";
  payload: any;
}
