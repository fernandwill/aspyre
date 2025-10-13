/**
 * Join conditional class name arguments into a single string.
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
}
