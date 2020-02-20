import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TodoItem } from './types';
import uuid from 'uuid';

export interface AppRootState {
  todos: TodoItem[];
}

const createTodo = (title: string): TodoItem => {
  return { id: uuid.v4(), title, done: false };
};

const slice = createSlice({
  name: 'todo-store',
  initialState: {
    todos: []
  } as AppRootState,
  reducers: {
    /**
     * Add a new todo item to the store
     */
    addTodo: (state, action: PayloadAction<{ title: string }>) => ({
      todos: [...state.todos, createTodo(action.payload.title)]
    }),
    /**
     * Finish a todo item (if it exists)
     */
    finishTodo: (state, action: PayloadAction<string>) => ({
      todos: state.todos.map(todo => {
        if (todo.id === action.payload) {
          return { ...todo, done: true };
        }
        return todo;
      })
    })
  }
});

export default slice.reducer;
export const { addTodo, finishTodo } = slice.actions;
