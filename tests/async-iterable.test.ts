import {
  consume,
  map,
  pipeline,
} from 'streaming-iterables';
import {
  concurrently,
  iterateLater,
  partition,
  resolveLater,
  toAsyncIterable,
} from '../src';

describe('Test Suite', () => {
  test('resolveLater', async () => {
    const [promise, resolve] = resolveLater();
    resolve(42);
    expect(await promise).toEqual(42);
  });

  test('toAsyncIterable', async () => {
    const iterable1 = toAsyncIterable(42);
    for await (const value of iterable1)
      expect(value).toEqual(42);
  
    const iterable2 = toAsyncIterable(Promise.resolve(42));
    for await (const value of iterable2)
      expect(value).toEqual(42);
  
    const iterable3 = toAsyncIterable([42]);
    for await (const value of iterable3)
      expect(value).toEqual(42);
  
    const iterable4 = toAsyncIterable([]);
    let catchFlag = false;
    try {
      for await (const _ of iterable4) {
        catchFlag = true;
        expect(true).toBe(false);
      }
    } catch (error) {
      expect(error).toBeDefined();
    }
    expect(catchFlag).toBe(false);
  
    let current = 0;
    const iterable5 = toAsyncIterable([0, 1, 2]);
    for await (const value of iterable5)
      expect(value).toEqual(current++);
  
    current = 0;
    const iterable6 = toAsyncIterable([Promise.resolve(0), 1, Promise.resolve(2)]);
    for await (const value of iterable6)
      expect(value).toEqual(current++);
  });

  test('iterateLater empty', async () => {
    const [iterable, _, complete] = iterateLater();
    complete();
    for await (const _ of iterable)
      expect(true).toBe(false);
  });

  test('iterateLater single value', async () => {
    const [iterable, next, complete] = iterateLater();
    next(42);
    complete();
    for await (const value of iterable)
      expect(value).toEqual(42);
  });

  test('iterateLater simple', async () => {
    const [iterable, next, complete] = iterateLater();
    next(0);
    next(1);
    next(2);
    complete();
    let current = 0;
    for await (const value of iterable)
      expect(value).toEqual(current++);
  });
});

describe('Test Suite', () => {
  const delay = (milliseconds: number | undefined) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
  const passOnValueWithDelay = (milliseconds: number | undefined) => (value: any) =>
    delay(milliseconds).then(() => value);

  const testIterateLaterWith = (
    scenario: string | number | (() => number),
    getInflowDelay: any| string | number | (() => number),
    getOutflowDelay: any | string | number | (() => number),
    totalPasses: string | number | (() => number)
  ) =>
    test(`iterateLater ${scenario}`, async () => {
      const [iterable, next, complete] = iterateLater();
      const fill = async () => {
        await pipeline(
          () => toAsyncIterable(Array.from(Array(totalPasses).keys())),
          map(passOnValueWithDelay(getInflowDelay())),
          map(next),
          consume
        );
        complete();
      };
      const use = async () => {
        let current = 0;
        for await (const value of iterable) {
          await delay(getOutflowDelay());
          expect(value).toEqual(current++);
        }
      };
      await concurrently(fill, use);
    });

  const randomDuration = () => Math.round(Math.random() * 40);

  [    ['slower inflow', () => 30, () => 10, 5],
    ['slower outflow', () => 10, () => 30, 15],
    ['random inflow/outflow speed', randomDuration, randomDuration, 50],
  ].forEach((args) =>
    testIterateLaterWith(args[0], args[1], args[2], args[3])
  );

  test('partition', async () => {
    let [p1, p2] = partition(42, toAsyncIterable([]));
    for await (const _ of p1)
      expect(true).toBe(false);

    for await (const _ of p2)
      expect(true).toBe(false);
    // @ts-ignore
    [p1, p2] = partition(1, toAsyncIterable([42]));
    for await (const value of p1)
      expect(value).toEqual(42);

    for await (const _ of p2)
      expect(true).toBe(false);
    // @ts-ignore
    [p1, p2] = partition(1, toAsyncIterable([0, 1, 2, 3, 4, 5, 6]));
    let current = 0;
    for await (const value of p1)
      expect(value).toEqual(current++);

    for await (const value of p2)
      expect(value).toEqual(current++);
  });

  test('concurrently', async () => {
    const result = await concurrently(
      ...Array(10).fill(() => 42),
      ...Array(10).fill(() => Promise.resolve(24))
    );
    expect(result.slice(0, 10)).toEqual(Array(10).fill(42));
    expect(result.slice(10)).toEqual(Array(10).fill(24));
  });
});