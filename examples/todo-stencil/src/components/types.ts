export interface TodoItem {
  id: string;
  title: string;
  done: boolean;
}

export interface AppRootState {
  todos: TodoItem[];
}
