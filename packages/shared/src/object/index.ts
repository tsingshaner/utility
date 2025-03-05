export { mergeObject, type MergeObjectOptions } from './merge'

export {
  /**
   * Like `deepCloneLite`, but adds object with RegExp, Date, Array, Map, Set, custom class, Int8Array, DataView, Buffer values
   * @see {@link https://www.npmjs.com/package/klona?activeTab=readme#klona}
   *
   * @public
   */
  klona as deepClone
} from 'klona'

export {
  /**
   * Like `deepClone`, but adds Symbol and non-enumerable properties
   * @see {@link https://www.npmjs.com/package/klona?activeTab=readme#klonafull}
   *
   * @public
   */
  klona as deepCloneFull
} from 'klona/full'

export {
  /**
   * Compares an array of objects comprised of JSON data types (String, Number, null, Array, Object)
   * @see {@link https://www.npmjs.com/package/klona?activeTab=readme#klonajson}
   *
   * @public
   */
  klona as deepCloneJSON
} from 'klona/json'

export {
  /**
   * Like `deepCloneJSON`, but adds RegExp, Date and undefined values
   * @see {@link https://www.npmjs.com/package/klona?activeTab=readme#klonalite}
   *
   * @public
   */
  klona as deepCloneLite
} from 'klona/lite'
