# async-iterable :parachute:

## Install
There are no dependencies.

```bash
npm i --save @ruffiano/async-iterable
```

We ship esm and types.

## API
- [`IncomingEvents()`](#IncomingEvents)
- [`resolveLater()`](#resolvelater)
- [`iterateLater()`](#iteratelater)
- [`partition()`](#partition)
- [`toAsyncIterable()`](#toasynciterable)
- [`firstValue()`](#firstvalue)
- [`lastValue()`](#lastvalue)
- [`valueAt()`](#valueat)
- [`concurrently()`](#concurrently)


### IncomingEvents
```ts
const incomingEvents = new IncomingEvents<any>(); // Replace any with your preferad type. Ex: Uint8Array or Custom type.

// Subscribe to incoming events
const subscription = incomingEvents.subscribe((data) => {
  // Handle incoming event
  console.log('Received event:', data);
});

// Emit an event
incomingEvents.next('Event 1');

// Emit another event
incomingEvents.next('Event 2');

// Unsubscribe
subscription.unsubscribe();

// Emit a third event after unsubscribing
incomingEvents.next('Event 3');
```
Another example:

```ts

type FileData = {
    meta: FileUpload;
    getContent: () => AsyncIterable<Uint8Array>;
    declareId(id: string): void;
};

const incomingEvents = new IncomingEvents<FileData>(); // Replace any with your preferad type. Ex: Uint8Array or Custom type.

// Emit a file
incomingFiles.next({
  meta: { /* file metadata */ },
  getContent: async () => {
    // Asynchronously retrieve file content
    const content = await fetch('file-url');
    const buffer = await content.arrayBuffer();
    return new Uint8Array(buffer);
  },
  declareId: (id) => {
    // Declare file ID
    console.log(`File ID: ${id}`);
  },
});

// Subscribe to incoming files
const subscription = incomingFiles.subscribe((data) => {
  // Handle incoming file data
  console.log(data);
});


// Unsubscribe
subscription.unsubscribe();
```


### resolveLater

```ts
function resolveLater<T>(): [Promise<T>, Resolve<T>]
// type Resolve<T> = (value?: T | PromiseLike<T>) => void;
```

Creates a `Promise` and passes its `resolve` to the outer scope (in the native Promise API, `resolve` is only accessible through `new Promise((resolve, reject) => {...})`).

```js
import { resolveLater } from '@ruffiano/async-iterable';

const [value, setValue] = resolveLater();
value.then(console.log);
setValue(42);
// 42
```

```ts
// Customizable backend for "save"

type SaveMethod = (blog: Blog, declareId: (id: string) => void) => any;
// We want to pass a callback, "declareId", to custom implementations
// to be invoked with "id" when they are done
let saveMethod: SaveMethod = async () => {}; // Default: no implementation
export function changeSaveMethod(method: SaveMethod) {
  saveMethod = method;
}

export function save(blog: Blog): Promise<string> { // returns Promise of saved blog's id
  const [id, resolve] = resolveLater<string>();
  saveMethod(blog, resolve);
  return id;  
}
```

### iterateLater

```ts
function iterateLater<T>(): [AsyncIterable<T>, Resolve<T>, () => void]
```

Creates `next()` and `complete()` interfaces for an `AsyncIterable`.

```js
import { iterateLater } from '@ruffiano/async-iterable';

const [iterable, next, complete] = iterateLater();
next(1);
next(2);
next(3);
complete();
for await (const value of iterable) {
  console.log(value);
}
// 1
// 2
// 3
```

### partition

```ts
function partition<T>(index: number, iterable: AsyncIterable<T>): [AsyncIterable<T>, AsyncIterable<T>]
```

Decomposes an `AsyncIterable` into two at an `index` (more partitions can be made by subsequent/recursive calls).

```js
import { partition, toAsyncIterable } from '@ruffiano/async-iterable';

const [p1, rest] = partition(2, toAsyncIterable([1, 2, 3, 4, 5]));
const [p2, p3] = partition(2, rest);
for await (const value of p1) {
  console.log(value);
}
// 1
// 2

for await (const value of p2) {
  console.log(value);
}
// 3
// 4

for await (const value of p3) {
  console.log(value);
}
// 5
```

### toAsyncIterable

```ts
function toAsyncIterable<T>(
  value: T | PromiseLike<T> | ObservableLike<T> | Iterable<PromiseLike<T> | T> | AsyncIterable<T>
): AsyncIterable<T>
// Curried overload suitable for pipeline:
export function toAsyncIterable<T>(): (
  value: T | PromiseLike<T> | ObservableLike<T> | Iterable<PromiseLike<T> | T> | AsyncIterable<T>
) => AsyncIterable<T>
```

Converts anything to an `AsyncIterable`!

```js
import { toAsyncIterable } from '@ruffiano/async-iterable';


for await (const value of toAsyncIterable(42)) {
  console.log(value);
}
// 42

for await (const value of toAsyncIterable(Promise.resolve(42))) {
  console.log(value);
}
// 42

for await (const value of toAsyncIterable([42])) {
  console.log(value);
}
// 42

for await (const value of toAsyncIterable([])) {
  console.log(value); // Will not execute
}

for await (const value of toAsyncIterable([1, 2, 3])) {
  console.log(value);
}
// 1
// 2
// 3

for await (const value of toAsyncIterable([1, Promise.resolve(2), Promise.resolve(3)])) {
  console.log(value);
}
// 1
// 2
// 3
```

### firstValue

```ts
function firstValue<T>(iterable: Iterable<T> | AsyncIterable<T>): Promise<T>
// Curried overload suitable for pipeline:
function firstValue<T>(): (iterable: Iterable<T> | AsyncIterable<T>) => Promise<T>
```

Returns the first value from an `AsyncIterable` as a `Promise`. The `Promise` rejects if iterable is empty.

```js
import { firstValue, toAsyncIterable } from '@ruffiano/async-iterable';

const iterable = toAsyncIterable([1, 2, 3]);

console.log(await firstValue(iterable));
// 1
```

### lastValue

```ts
function lastValue<T>(iterable: Iterable<T> | AsyncIterable<T>): Promise<T>
// Curried overload suitable for pipeline:
function lastValue<T>(): (iterable: Iterable<T> | AsyncIterable<T>) => Promise<T>
```

Returns the last value from an `AsyncIterable` as a `Promise`. The `Promise` rejects if iterable is empty.

```js
import { lastValue, toAsyncIterable } from '@ruffiano/async-iterable';

const iterable = toAsyncIterable([1, 2, 3]);

console.log(await lastValue(iterable));
// 3
```

### valueAt

```ts
function valueAt<T>(index: number, iterable: Iterable<T> | AsyncIterable<T>): Promise<T>
// Curried overload suitable for pipeline:
function valueAt<T>(index: number): (iterable: Iterable<T> | AsyncIterable<T>) => T
```

Returns the value specified by an `index` in an `AsyncIterable`, as a `Promise`. The `Promise` rejects if iterable is empty or `index` >= length.

```js
import { valueAt, toAsyncIterable } from '@ruffiano/async-iterable';

const iterable = toAsyncIterable([1, 2, 3]);

console.log(await valueAt(1, iterable));
// 2
```

### concurrently

```ts
function concurrently<T>(...functions: (() => T | PromiseLike<T>)[]): Promise<T[]>
```

Invokes `functions` with `Promise.all`
```js
import { concurrently } from '@ruffiano/async-iterable';

const result = await concurrently(
  () => 42,
  () => Promise.resolve(42),
  async () => 42,
  () => 24,
  async () => 24
);
console.log(result)
// [42, 42, 42, 24, 24]
```
