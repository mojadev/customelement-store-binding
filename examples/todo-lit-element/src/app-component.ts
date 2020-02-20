import { useStore, LIT_ELEMENT, bindSelector, storeAction } from "customelement-store-binding";
import { customElement, LitElement, html, property } from "lit-element";
import { AppRootState, addTodo, finishTodo } from "./reducer";
import { TodoItem } from "./types";
import { ceName } from "./component-name";

@customElement(ceName("todo-list"))
@useStore({ renderFn: LIT_ELEMENT })
export class TodoListElement extends LitElement {
  /**
   * Simple selector of all root items
   */
  @bindSelector((x: AppRootState) => x.todos)
  private todos: TodoItem[] = [];

  @property()
  private currentTitle: string = "";

  /**
   * Dispatch a finishTodo action to mark the given todo as done.
   *
   * @param todoId The ID of the TODO /item
   */
  private finishTodo(todoId: string) {
    const action = finishTodo(todoId);
    this.dispatchEvent(storeAction(action));
  }

  /**
   * Dispatch a addTodo action to add the given title to the todo list
   *
   * @param title
   */
  private addTodo(title: string) {
    const action = addTodo({ title });
    this.dispatchEvent(storeAction(action));
    this.currentTitle = "";
  }

  /**
   * Set the title value to the new entry if an user changed it.
   */
  private onTitleChange = (ev: Event) => {
    this.currentTitle = (ev.target as HTMLInputElement)!.value;
  };

  /**
   * Render all the things.
   */
  render() {
    return html`
      <ul>
        ${this.todos.map(this.renderTodo)}
      </ul>

      <input
        name="title"
        type="text"
        class="todo__text-input"
        .value=${this.currentTitle}
        @change=${this.onTitleChange}
      />
      <button class="todo__add-btn" @click=${() => this.addTodo(this.currentTitle)}>
        +
      </button>
    `;
  }

  private renderTodo = (todo: TodoItem) => html`
    <li class="todo-item">
      <span>${todo.done ? "✔️" : ""} ${todo.title}</span>
      <button class="todo__finish-btn" id="finish-${todo.id}" @click="${() => this.finishTodo(todo.id)}">
        ✔️
      </button>
    </li>
  `;
}
