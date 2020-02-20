# Redux Custom Elements Bindings

## tl;dr

A simple WebComponent using this library (and lit-Element, which is not required):

```typescript
// this is LitElement, not required for this lib
@customElement('todo-count')
// This registers the default store
@useStore({ renderFn: LIT_ELEMENT })
export class TodoCountComponent extends LitElement {
  // A simple selector
  @bindSelector((x: AppRootState) => x.todos.length)
  private nrOfItems: number = 0;

  // Another selector - this can also be a reselect function
  @bindSelector((x: AppRootState) => x.todos.filter(x => x.done).length)
  private nrOfFinishedItems: number = 0;

  render() {
    return html`
      <div>
        ${this.nrOfFinishedItems} / ${this.nrOfItems} Finished
      </div>
    `;
  }
}
```

## About

Minimal boilerplate redux bindings for web components with the following features:

- Based on decorators rather than connect / map functions
- Scopes: No direct binding to the store and support for multiple stores (if you want)
- Fully testable with && without redux functionally
- Minimal footprint

## Getting Started

### 1. Installation

```
npm install webcomponent-store-binding
```

### 2. Register your store

In most cases setup is done like this:

```typescript
import { registerDefaultStore } from 'webcomponent-store-binding';

const store = // however you setup your store
  // Register the store as the default
  registerDefaultStore(store);
```

### 3. Bind your components to the scope

```typescript
import {useStore, bindSelector} from 'webcomponent-store-binding';

// This enables redux support for this component using the default store
// You can use a custom render function that should be triggered on state changes using renderFn.
// Default functions for e.g. LitElement are already provided
@useStore({renderFn: el => el.render() })
class MyComponent extends HTMLElement {

    // By using @bindSelector the value of the field will
    // be updated
    @bindSelector((x: MyRootState) => x.someValue)
    private value: string = "";

    render() {
        this.innerHTML = `<div>${value}</div>`;
    }
}
customElements.define('my-component', MyComponent);:W

```

### 4. Dispatch actions

Actions can be dispatched by talking directly to the store, but this couples the web component to the redux implementation. The preferred approach in DOM enabled environments is to use DOM Events and the `storeAction()` function that wraps elements in a CustomEvent which will be forwarded to the store

```typescript
import { storeAction } from 'webcomponent-store-binding';

class MyComponent extends HTMLElement {
  private triggerStuff() {
    // normally this will be defined in a central place, but let's keep it simple
    const action = { type: 'triggerAction' };
    this.dispatchEvent(storeAction(action));
  }
}
```

Notice that you do not need any decorators for dispatching actions. DOM Events ftw!

## Testing

```typescript
import { resetStoreRegistry, registerDefaultStore } from 'webcomponent-store-binding';

describe("My component", () => {
  let storeMock = {
     getState: // your mock function
     subscribe:
  } as Store
  beforeEach(() => {

     registerDefaultStore()
  })

  afterEach(() => {

  })
})

```
