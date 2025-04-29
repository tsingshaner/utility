/**
 * Media features & values map.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features | MDN Reference}
 *
 * @public
 */
export interface MediaFeatures {
  /** @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors | MDN Reference} */
  'forced-colors': 'active' | 'none'
  'prefers-color-scheme': 'dark' | 'light' | 'no-preference'
}

/**
 * A media query string create helper.
 * @param feature - Media feature to query.
 * @param value - Media value.
 *
 * @public
 */
export const createMediaFeatureQuery = <T extends keyof MediaFeatures, K extends MediaFeatures[T]>(
  feature: T,
  value: K
): `(${T}: ${K})` => `(${feature}: ${value})`

/**
 * Media query helper.
 * @param feature - Media feature to query.
 * @param value - Media value.
 *
 * @public
 */
export const mediaQuery = <T extends keyof MediaFeatures>(feature: T, value: MediaFeatures[T]): MediaQueryList =>
  window.matchMedia(createMediaFeatureQuery(feature, value))
