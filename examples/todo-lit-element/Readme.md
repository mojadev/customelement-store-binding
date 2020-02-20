# LitElement Example

A simple To-do app that shows how to use the decorators and how to setup a project in a simple way.

## Quick start:

```
npm install
npm run serve
```

## Tests

This example also includes two different ways to test an application

- [app-component.spec.ts](./src/app-component.spec.ts): Using a unit-test approach without calling any real store functionality
- [app-omponent.withStore.spec.ts](./src/app-omponent.withStore.spec.ts): Using an actual store to go for a more integrative, behaviour-driven approach.

To call the tests run:

```
npm run test -- --watch
```

Testing is done using karma, as - imho and in the beginning of the year 2020 - this is the closest and simplest way of testing web components.
