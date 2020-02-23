import { h, Component, Host } from "@stencil/core";

@Component({
  tag: "app-root"
})
export class AppRoot {
  render() {
    return (
      <Host>
        <h1>Stencil Example Todo</h1>
        <todo-list></todo-list>
        <todo-count></todo-count>
      </Host>
    );
  }
}
