import { AnyAction, StoreLike } from './types';

export class MockStore<S> implements StoreLike<S> {
  public dispatched: AnyAction[] = [];
  public subscriber: Array<() => void> = [];
  public state: S;

  constructor(state: S) {
    this.state = state;
  }

  dispatch(action: AnyAction) {
    this.dispatched.push(action);
  }

  getState(): S {
    return this.state;
  }

  subscribe(listener: () => void) {
    this.subscriber.push(listener);
    return () => {
      this.subscriber = this.subscriber.filter(x => x !== listener);
    };
  }

  updateState(state: S) {
    this.state = state;
    this.subscriber.forEach(x => x());
  }
}
