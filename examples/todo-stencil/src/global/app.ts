import { configureStore, Store } from "@reduxjs/toolkit";
import { registerDefaultStore } from "customelement-store-binding";

import todos from "../components/reducer";

export default async () => {
  const store = configureStore({
    reducer: todos
  }) as Store;
  /**
   * This store is used without a scope.
   * When using multiple applications/microfrontends with different stores this could lead to
   * overwriting the default store.
   */
  registerDefaultStore(store);
};
