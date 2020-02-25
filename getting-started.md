<nav class="navigation-top">
  <a href="../">:mega: Overview</a>
  <a href="../getting-started">:running: Getting Started</a>
  <a href="../reference">:notebook: Reference</a>
</nav>

# Getting Started

Connecting a redux store to your custom-elements is just a matter of a few lines of code.
We will use `reduxjs/toolkit` in this example, but it's up to you how you want to create your store.

## 1. Create your store

Somewhere in your application you will be creating your store. Often this happens in your app.ts/app.js file:

```ts
import { configureStore, Store } from '@reduxjs/toolkit';

// This are your reducers and called however you want to call them
import todos from './reducer';

// create your store however you want
export const store = configureStore({
  reducer: todos
}) as Store;
```

Looks familiar? Nothing happening with this lbrary so far, let's change that.

## 2. Register your store

Instead of importing your store and accessing it directly (which is also possible) you register your store under a _scope_.
A _scope_ is accessible under a [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol). Customelement-store-binding also allows you to register a store under a default store.

```diff
import { configureStore, Store } from '@reduxjs/toolkit';
+ import { registerDefaultStore } from "customelement-store-binding";

// This are your reducers and called however you want to call them
import todos from './reducer';

// create your store however you want
export const store = configureStore({
  reducer: todos
}) as Store;

+ // Register the store as the default store
+ registerDefaultStore(store);
```

In case you have multiple stores or want to integrate with code which could already register a default store it's best to define a custom scope:

```diff
import { configureStore, Store } from '@reduxjs/toolkit';
-import { registerDefaultStore } from "customelement-store-binding";
+import { registerStore } from "customelement-store-binding";
+import { storeScope } from "./symbols";

// This are your reducers and called however you want to call them
import todos from './reducer';

// create your store however you want
export const store = configureStore({
  reducer: todos
}) as Store;

- registerDefaultStore(store);
+ registerStore(storeScope, store);
```

with ./symbols.ts containing:

```ts
// for unique symbols (no outside deployment will ever clash with this)
export const storeScope = new Symbol('myStore');
// for recretable symbols
export const constantScope = Symbol.for('myStore');
```

## 3. Connect the store to your web-component

### Vanilla Custom Elements, lit-element, etc.

First step in using the store in your component is connecting it using the `@useStore` decorator.

```ts
import { useStore } from 'customelement-store-binding';

// that's all there is when you use a default store
@useStore()
class MyComponent extends HTMLElement {}

customElements.define('my-component', MyComponent);
```

> Use `@useStore({ scope: storeScope })` when using a custom scope

Additionally, it makes sense to define the `renderFn` option in the `@useStore` decorator, which will be called
as soon as the store changes.

```ts
import { useStore } from 'customelement-store-binding';

// the render function to call on store changes
@useStore({ renderFn: el => el.render() })
class MyComponent extends HTMLElement {
  render() {
    // render all the things
    this.innerHTML = ``;
  }
}

customElements.define('my-component', MyComponent);
```

> **Lit-Element users**: When using lit-element, you can use the `LIT_ELEMENT` renderFn provided. Check out the [todo-lit-element](https://github.com/mojadev/customelement-store-binding/blob/master/examples/todo-lit-element/src/app-component.ts) example

### Stencil

Stencil does not support class decorators as they actually derive a lot of information during compile time.
For this reason, an alternative is to register the store using the `useStoreFor` function and passing the instance.

```ts
@Component({
  tag: 'my-component'
})
export class MyComponent {
  constructor() {
    // this does the same like the @useStore decorator
    useStoreFor(this);
  }
  v;
}
```

## 4. Bind selectors to your properties

Connecting the store isn't much of a use when you don't work with the stores content.
For this the `@bindSelector` decorator can be used for fields.

```ts
import { useStore, bindSelector } from 'customelement-store-binding';

@useStore({ renderFn: el => el.render() })
class MyComponent extends HTMLElement {
  // get the content field from the store on updates
  @bindSelector(x => x.content)
  private content: string;

  render() {
    // simple content
    this.innerHTML = `Content is ${this.content}`;
  }
}

customElements.define('my-component', MyComponent);
```

> **For Stencil** just add `@State()` above the `@bindSelector` and you'll get immediate updates without using the `renderFn`. Check out the [Stencil Example](https://github.com/mojadev/customelement-store-binding/blob/master/examples/todo-stencil/src/components/todo-list/todo-list.tsx).

## 5. Dispatch actions

In a DOM enabled environment, actions are dispatched using [CustomEvents](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent). This has the advantage that your components do not need to know anything about your store and no specific API is required to dispatch events (you don't need any decorators for this).

To wrap your action in a CustomEvent, the `storeAction` function can be used:

```ts
import { storeAction} from "customelement-store-binding";
import { addTodo } from "./store/actions";

  // ...
  private addTodo(title: string) {
    const action = addTodo({ title });
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
    this.dispatchEvent(storeAction(action));
  }
```

### Stencil events

Stencil doesn't allow constants in the `@Event` decorator right now (see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events). So until a different solution is found here, you need to use the event name from this library inside an event emitter (stencil does not extend from HTMLElement).

```ts
@Event({ eventName: "dispatchStoreAction", bubbles: true, composed: true })
private dispatchAction: EventEmitter;
```

Take a look at the [stencil example](https://github.com/mojadev/customelement-store-binding/blob/master/examples/todo-stencil/src/components/todo-list/todo-list.tsx) if you want to see it in action.

## 6. Test it

Being able to test your components is quite important. There are multiple options how to test your component, depending on your prefered testing and coding style:

### Option 1: Ignore store completely

As the decorators to nothing in case no store is bound, you could simply ignore a store being bound and set all state values manually. This is easy if your fields are public or have some sort of settor, of course.

### Option 2: Use the MockStore

You can use the `MockStore` provided by this package and bind it as your default store before testing the component. As there is no reducer logic you will only be able to observe events being emitted - which can be enough in a lot of cases.

Just remember to register your store in beforeEach and clean up the registry in afterEach (or the equivalent in your testing framework):

```ts
import { MockStore, registerDefaultStore, resetStoreRegistry } from "customelement-store-binding";

describe("my component", () => {
  let store: MockStore<AppState>;

  beforeEach(() => {
    store = new MockStore<AppRootState>({ todos: [] });
    registerDefaultStore(store);
  });

  it("should test that something happens", (
    // ..update the state
    store.setState({...store.getState(), content: 'test' });
    // ..listen for actions
    const eventSpy = jasmine.createSpy('actionSpy');
    document.addEventListener("dispatchStoreAction", eventSpy, { once: true });
    // ...
    expect(eventSpy).toHaveBeenCalledWith(...);
  ))

  afterEAch(() => {
    // this removes the effect of all register*Store functions
    resetStoreRegistry();
  });

});
```

> A full example of this testing style can be found in the [lit-element tests](https://github.com/mojadev/customelement-store-binding/blob/master/examples/todo-lit-element/src/app-component.spec.ts)

### Option 3: Use an actual store with reducers

The last option is the one nearest to how your component will be used (which is good), but also the one that departs the most from actual unit testing to integration tests (which can be bad, but doesn't need to be): Binding an actual store with
reducers.

This is actually the same as Option 2, but instead of instantiating `MockStore` you will create the actual store:

```ts
beforeEach(() => {
  // use the actual store
  registerDefaultStore(configureStore({ reducer: todos }));
});
```

You find a full example using this approach in [the lit-element-todo example](https://github.com/mojadev/customelement-store-binding/blob/master/examples/todo-lit-element/src/app-component.withStore.spec.ts) and in the [stencil todo example](https://github.com/mojadev/customelement-store-binding/blob/master/examples/todo-stencil/src/components/todo-list/todo-list.spec.ts).

> For stencil, be aware that you need to bind the store _after_ calling `newSpecPage`, but before `await`ing it's result, otherwise you bind your store to the wrong document. Check out the example to see what that means.
