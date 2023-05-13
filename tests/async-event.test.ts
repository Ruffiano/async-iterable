import { IncomingEvents } from '../src';

describe('IncomingEvents', () => {
  let incomingEvents: IncomingEvents<number>;

  beforeEach(() => {
    incomingEvents = new IncomingEvents<number>();
  });

  test('subscribe and notify subscribers', () => {
    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();

    incomingEvents.subscribe(subscriber1);
    incomingEvents.subscribe(subscriber2);

    incomingEvents.next(42);

    expect(subscriber1).toHaveBeenCalledWith(42);
    expect(subscriber2).toHaveBeenCalledWith(42);
  });

  test('unsubscribe a subscriber', () => {
    const subscriber = jest.fn();
    const subscription = incomingEvents.subscribe(subscriber);

    incomingEvents.unsubscribe(subscriber);
    incomingEvents.next(42);

    expect(subscriber).not.toHaveBeenCalled();
    expect(subscription.unsubscribe).toBeDefined();
  });

  test('unsubscribe from subscription', () => {
    const subscriber = jest.fn();
    const subscription = incomingEvents.subscribe(subscriber);

    subscription.unsubscribe();
    incomingEvents.next(42);

    expect(subscriber).not.toHaveBeenCalled();
    expect(subscription.unsubscribe).toBeDefined();
  });
});
