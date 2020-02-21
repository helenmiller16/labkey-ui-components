// DeepReadOnly<T> is from here: https://github.com/krzkaczor/ts-essentials/blob/master/lib/types.ts
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
export type Primitive = string | number | boolean | bigint | symbol | undefined | null;
export type Builtin = Primitive | Function | Date | Error | RegExp;
export type DeepReadonly<T> = T extends Builtin
    ? T
    : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends ReadonlyMap<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends WeakMap<infer K, infer V>
    ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends Set<infer U>
    ? ReadonlySet<DeepReadonly<U>>
    : T extends ReadonlySet<infer U>
    ? ReadonlySet<DeepReadonly<U>>
    : T extends WeakSet<infer U>
    ? WeakSet<DeepReadonly<U>>
    : T extends Promise<infer U>
    ? Promise<DeepReadonly<U>>
    : T extends {}
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : Readonly<T>;
