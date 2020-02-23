import { AnyAction, StoreLike } from './types';
export declare class MockStore<S> implements StoreLike<S> {
    dispatched: AnyAction[];
    subscriber: Array<() => void>;
    state: S;
    constructor(state: S);
    dispatch(action: AnyAction): void;
    getState(): S;
    subscribe(listener: () => void): () => void;
    updateState(state: S): void;
}
