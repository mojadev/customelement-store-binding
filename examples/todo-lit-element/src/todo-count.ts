import { customElement, LitElement, html } from "lit-element";
import { useStore, bindSelector, LIT_ELEMENT } from "customelement-store-binding";
import { AppRootState } from "./reducer";
import { ceName } from "./component-name";

@customElement(ceName("todo-count"))
@useStore({ renderFn: LIT_ELEMENT })
export class TodoCountComponent extends LitElement {
  @bindSelector((x: AppRootState) => x.todos.length)
  private nrOfItems: number = 0;

  @bindSelector((x: AppRootState) => x.todos.filter(x => x.done).length)
  private nrOfFinishedItems: number = 0;

  render() {
    return html`
      <div>${this.nrOfFinishedItems}/${this.nrOfItems} Finished</div>
    `;
  }
}
