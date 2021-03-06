export interface StoreLike<S> {
    getState(): S;
    subscribe(cb: () => void): UnsubscribeFunction;
    dispatch(action: AnyAction): void;
}
export interface AnyAction {
    type: string;
    [key: string]: any;
}
export declare type UnsubscribeFunction = () => void;
/**
 * Action Dispatcher function prototype.
 */
export declare type ActionDispatcher = (action: AnyAction) => void;
