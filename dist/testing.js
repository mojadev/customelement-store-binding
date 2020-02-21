export class MockStore {
    constructor(state) {
        this.dispatched = [];
        this.subscriber = [];
        this.state = state;
    }
    dispatch(action) {
        this.dispatched.push(action);
    }
    getState() {
        return this.state;
    }
    subscribe(listener) {
        this.subscriber.push(listener);
        return () => {
            this.subscriber = this.subscriber.filter(x => x !== listener);
        };
    }
    updateState(state) {
        this.state = state;
        this.subscriber.forEach(x => x());
    }
}
