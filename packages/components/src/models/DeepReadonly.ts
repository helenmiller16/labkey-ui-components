// DeepReadOnly<T> is described here: https://stackoverflow.com/a/49670389
// In the future, TypeScript may add DeepReadOnly<T>: https://github.com/microsoft/TypeScript/issues/13923
// If DeepReadOnly is added in a future release of TypeScript we should remove ours, just like we did with Omit<T>.
// See also: https://www.sitepoint.com/compile-time-immutability-in-typescript/

/**
 * Wrap a type or interface with Immutable to add compile-time Immutability to your types. It is probably best to
 * define two types that you can use interchangeably like so:
 *
 * interface Point {
 *     x: number;
 *     y: number;
 *     options: { flip: boolean };
 * }
 *
 * type ReadOnlyPoint = DeepReadOnly<Point>;
 *
 * This way you do not need to constantly redefine DeepReadOnly<Point> throughout the codebase.
 */
export type DeepReadonly<T> =
    T extends (infer R)[] ? DeepReadonlyArray<R> :
    T extends Function ? T :
    T extends object ? DeepReadonlyObject<T> :
    T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
