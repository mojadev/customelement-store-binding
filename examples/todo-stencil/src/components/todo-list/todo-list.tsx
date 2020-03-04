import { Component, h, State } from "@stencil/core";
import { useStoreFor, bindSelector, dispatcher } from "customelement-store-binding";
import { finishTodo, addTodo } from "../reducer";
import { TodoItem, AppRootState } from "../types";
import { ActionDispatcher } from "../../../../../dist/types";

@Component({
  tag: "todo-list"
})
export class TodoList {
  /**
   * The dispatcher annotation is used here instead of dispatchEvent as TodoList
   * does not derive from HTMLElement in stencil.
   */
  @dispatcher()
  private dispatchAction: ActionDispatcher;

  @State()
  @bindSelector((x: AppRootState) => x.todos)
  public todos: TodoItem[] = [];

  @State()
  private currentTitle: string = "";

  constructor() {
    useStoreFor(this);
  }

  /**
   * Dispatch a finishTodo action to mark the given todo as done.
   *
   * @param todoId The ID of the TODO /item
   */
  private finishTodo(todoId: string) {
    const action = finishTodo(todoId);
    this.dispatchAction(action);
  }

  /**
   * Dispatch a addTodo action to add the given title to the todo list
   *
   * @param title
   */
  private addTodo(title: string) {
    const action = addTodo({ title });
    this.dispatchAction(action);
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
    return (
      <div>
        <ul>{this.todos.map(this.renderTodo)}</ul>

        <input name="title" type="text" class="todo__text-input" value={this.currentTitle} onChange={this.onTitleChange} />
        <button class="todo__add-btn" onClick={() => this.addTodo(this.currentTitle)}>
          +
        </button>
      </div>
    );
  }

  private renderTodo = (todo: TodoItem) => (
    <li class="todo-item">
      <span>
        {todo.done ? "✔️" : ""} {todo.title}
      </span>
      <button class="todo__finish-btn" id={`finish-${todo.id}`} onClick={() => this.finishTodo(todo.id)}>
        ✔️
      </button>
    </li>
  );
}
