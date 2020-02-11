// Immutable<T> is described here:
// https://www.sitepoint.com/compile-time-immutability-in-typescript/
// In the future, TypeScript may add DeepReadOnly<T>:
// https://github.com/microsoft/TypeScript/issues/13923
// If DeepReadOnly is added in a future release of TypeScript we should remove Immutable<T>, just like we did with
// Omit<T>.
/**
 * Wrap a type or interface with Immutable to add compile-time Immutability to your types. It is probably best to
 * define two types that you can use interchangeably like so:
 *
 * interface Point {
 *     x: number;
 *     y: number;
 * }
 *
 * type ImmutablePoint = Immutable<Point>;
 *
 * This way you do not need to constantly redefine Immutable<Point> throughout the codebase.
 */
export type Immutable<T> = {
    readonly [K in keyof T]: Immutable<T[K]>;
};
