export type Resolve<T> = (value?: T | PromiseLike<T>) => void;

export function resolveLater<T>(): [Promise<T>, Resolve<T>] {
  let resolve: any;
  const promise =
    new Promise<T> ((resolveCallback) => {
      resolve = resolveCallback;
    });
  if (resolve !== undefined) return [promise, resolve];
  throw 'Something Wrong';
}