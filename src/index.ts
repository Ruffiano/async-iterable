export type Resolve<T> = (value?: T | PromiseLike<T>) => void;

export interface ObservableLike<T> {
  subscribe(
    next: (value?: T) => void,
    error: (error: any) => void,
    complete: () => void
  ): any;
}

export class IncomingEvents<T> {
  private subscribers: Array<(data: T) => void> = [];

  private notifySubscribers(data: T) {
    for (const subscriber of this.subscribers) {
      subscriber(data);
    }
  }

  public subscribe(subscriber: (data: T) => void) {
    this.subscribers.push(subscriber);
    return {
      unsubscribe: () => {
        this.unsubscribe(subscriber);
      },
    };
  }

   unsubscribe(subscriber: (data: T) => void) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  public next(data: T) {
    this.notifySubscribers(data);
  }
}

export * from './resolve-later.js';
export * from './iterate-later.js';
export * from './to-async-iterable.js';
export * from './partition.js';
export * from './value.js';
export * from './concurrently.js';