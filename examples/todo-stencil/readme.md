# Stencil Example

This example shows how to integrate the store into stencil component.

Stencil actually only supports a subset of Typescript due to it's heavy static analysis, so decorators on classes and extension is not supported. For this reason, the `@useStore` decorator is not usable directly and
the store must be bound using the `useStoreFor(instance)` function in the constructor.

Also events must be fired using the `@dipatch` annotation which instantiates an `ActionDispatcher`.
Other than that, most of the example is the same like in lit-html, also the tests are quite similar.
