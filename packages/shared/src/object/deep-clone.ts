// /**
//  *
//  * This module is deep inspired by {@link https://www.npmjs.com/package/klona | klona} package.
//  *
//  * License of klona package:
//  * MIT License Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
//  *
//  */

// import type { AnyFunc } from "../types"

// // cspell:words lukeed

// // type DirectlyCopiabled = Exclude<PrototypeStringTag, 'BigInt' | 'Boolean' | 'Function' | 'String' | 'Symbol'>
// const cloneRegExp = (re: RegExp): RegExp => {
//   const clonedRegExp = new RegExp(re.source, re.flags)
//   clonedRegExp.lastIndex = re.lastIndex
//   return clonedRegExp
// }

// const cloneFunction = <T extends AnyFunc>(fn: T): T => {
//   const clonedFunction = fn
//   const
// }

// const cloneDataView = (dv: DataView): DataView => new DataView(dv.buffer)

type PrototypeStringTag =
  | 'Array'
  | 'BigInt'
  | 'Boolean'
  | 'Date'
  | 'Function'
  // Object Types
  | 'Map'
  | 'Number'
  | 'Object'
  | 'RegExp'
  | 'Set'
  | 'String'
  | 'Symbol'
  | 'WeakMap'
  | 'WeakSet'
  | ({} & string)

/**
 * Get the Symbol.toStringTag of a value. e.g. [object Date] -> Date
 * @param v - The value to get the Symbol.toStringTag.
 * @returns The Symbol.toStringTag of the value.
 *
 * @internal
 */
export const getStringTag = (v: unknown): PrototypeStringTag =>
  Object.prototype.toString.call(v).slice(8, -1) as PrototypeStringTag

// /**
//  * Deep clone a value, don't support custom class, Date, Set, Map, Symbol, and RegExp.
//  * @param value - The value to clone.
//  * @param __map - A WeakMap to store the cloned object, for check loop value.
//  * @returns The cloned object.
//  *
//  * @remarks
//  * This method deep copy the object, but don't support custom class, Date, Set, Map, Symbol, and RegExp.
//  * But it will directly copy the value of the object, not the reference.
//  * If you want to omit function & other JSON-incompatible values, you can use {@link structuredClone}.
//  *
//  * @public
//  */
// export const deepCloneBasic = <T>(value: T, __map?: WeakMap<WeakKey, WeakKey>): T => {
//   if (value === null || typeof value !== 'object') {
//     return value
//   }

//   structuredClone(value)

//   const clonedMap = __map ?? new WeakMap()

//   if (clonedMap.has(value)) {
//     return clonedMap.get(value) as T
//   }

//   if (Array.isArray(value)) {
//     const clonedArray: unknown[] = []
//     clonedMap.set(value, clonedArray)

//     for (let i = 0; i < value.length; i++) {
//       clonedArray[i] = deepCloneBasic(value[i], clonedMap)
//     }

//     return clonedArray as T
//   }

//   const clonedObj = {}
//   clonedMap.set(value, clonedObj)
//   for (const key of Reflect.ownKeys(value)) {
//     Reflect.set(clonedObj, key, deepCloneBasic(Reflect.get(value, key), clonedMap))
//   }

//   return clonedObj as T
// }

// /**
//  * Deep clone a value, support custom class, Date, Set, Map, Symbol, and RegExp.
//  * @param obj - The object to clone.
//  * @param __map - A WeakMap to store the cloned object, for check loop value.
//  * @returns The cloned object.
//  */
// export const deepCloneLite = <T>(value: T, __map?: WeakMap<WeakKey, WeakKey>): T => {
//   if (value === null || typeof value !== 'object') {
//     if (typeof value === 'function') {

//     }

//     return value
//   }

//   const clonedMap = __map ?? new WeakMap()

//   if (clonedMap.has(value)) {
//     return clonedMap.get(value) as T
//   }

//   const stringTag = getStringTag(value)
//   switch (stringTag) {
//     case 'Date':
//       return new Date(value as unknown as Date) as T
//     case 'RegExp':
//       return cloneRegExp(value as unknown as RegExp) as T
//     case 'Symbol':
//       return Symbol.for((value as unknown as Symbol).description) as T
//     case 'Object':
//   }
// }

// /**
//  * Deep clone an object. Support RegExp, Date, Map, Set, and loop object.
//  * @param obj - The object to clone.
//  * @returns The cloned object.
//  *
//  * @remarks
//  * This function will deep clone the object.
//  *
//  * @public
//  */
// export const deepClone = <T extends object>(obj: T, map?: WeakMap<T, object>): T => {
//   if (obj === null) {
//     return obj
//   }

//   const stringTag = getStringTag(obj)
//   switch (stringTag) {
//     case 'Object': {
//     }
//   }

//   // switch (typeof obj) {
//   //   case 'boolean':
//   //   case 'string':
//   //     return obj
//   //   // case 'symbol'
//   // }

//   // if (obj == null || typeof obj !== 'object') {
//   //   return obj
//   // }

//   // const clonedMap = map ?? new WeakMap<T, object>()
//   // if (clonedMap.has(obj)) {
//   //   return clonedMap.get(obj) as T
//   // }

//   // Reflect.

//   // if ()

//   // const type = Object.prototype.toString.call(obj).slice(8, -1) // [object XXX]
//   // switch (type as PrototypeString) {
//   //   case 'Array': {
//   //   }
//   // }
// }
