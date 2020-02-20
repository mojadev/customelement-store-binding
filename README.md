[![Build Status](https://travis-ci.org/mojadev/customelement-store-binding.svg?branch=master)](https://travis-ci.org/mojadev/customelement-store-binding)

# Customelement Store-Binding

## About

Minimal boilerplate redux-ish store bindings for web components with the following features:

- Based on decorators rather than connect / map function boilerplate
- Test-friendly without forcing an approach to the user
- Scopes: No direct binding to the store and support for multiple stores (if you want that)
- Minimal footprint and dependencies

## tl;dr

A simple WebComponent using this library (and lit-Element, which is not required):

```typescript
// this is LitElement, which is not required, but makes the example less verbose
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

Testing is quite easy and can be done either in a unit-test like way or in a more integrative way. The first approach is using the provided MockStore and provides state changes directly by setting the state, while actions are only observed. the latter approach creates an actual redux store and tests your component against this store, focusing on the real behaviour while sacrifying stricter test boundaries.

You can find full examples of both ways in the [examples](./examples/todo-lit-element), but as a reference:

### Testing against the mock store

Register a mock store and modify it directly in your tests:

```typescript
let store: MockStore<AppRootState>;

beforeEach(() => {
  store = new MockStore<AppRootState>({ todos: [] });
  registerDefaultStore(store);
});

afterEach(() => {
  resetStoreRegistry();
});

it('should display all todos from the store is updated', async () => {
  const root = (await createElement()).shadowRoot as ShadowRoot;
  store.updateState({ todos: [{ id: '1234', title: 'hello', done: false }] });

  expect(root?.querySelectorAll('li').length).toBe(1);
});
```

### Testing against a real store

Create a real store (with the important reducer subset) and run your tests against it:

```typescript
beforeEach(() => {
  // use the actual store
  registerDefaultStore(configureStore({ reducer: todos }));
});

afterEach(() => {
  resetStoreRegistry();
});

it('should add a todo when entering a text and clicking on add', async () => {
  const expectedText = 'New Todo';
  const root = (await createElement()).shadowRoot as ShadowRoot;

  enterTodoText(root, expectedText);
  clickAddButton(root);
  await tick();

  const todoItems = root?.querySelectorAll('li > span') as NodeListOf<
    HTMLSpanElement
  >;
  expect(todoItems.length).toBe(1);
  expect(todoItems[0].innerText.trim()).toMatch(expectedText);
});
```

## Open Topics

- Improve/Enforce type-safety
- Evaluate pure JavaScript Examples
- Add more integration examples and connectors (Angular, React, Stencil)
- Add more examples for non-redux stores (mobx, akita, etc.)
