export interface StoreLike<S> {
  getState(): S;
  subscribe(cb: () => void): UnsubscribeFunction;
  dispatch(action: AnyAction): void;
}

export interface AnyAction {
  type: string;
  [key: string]: any;
}

export type UnsubscribeFunction = () => void;

/**
 * Action Dispatcher function prototype.
 */
export type ActionDispatcher = (action: AnyAction) => void;
