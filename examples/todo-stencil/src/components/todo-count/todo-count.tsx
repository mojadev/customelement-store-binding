import { bindSelector, useStoreFor } from "customelement-store-binding";
import { h, Component, State } from "@stencil/core";
import { AppRootState } from "../types";

@Component({
  tag: "todo-count"
})
export class TodoCountComponent {
  @State()
  @bindSelector((x: AppRootState) => x.todos.length)
  private nrOfItems: number = 0;

  @State()
  @bindSelector((x: AppRootState) => x.todos.filter(x => x.done).length)
  private nrOfFinishedItems: number = 0;

  constructor() {
    useStoreFor(this);
  }

  render() {
    return (
      <div>
        {this.nrOfFinishedItems}/{this.nrOfItems} Finished
      </div>
    );
  }
}
