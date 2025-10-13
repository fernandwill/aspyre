import { useCallback, useEffect, useRef } from 'react'

/**
 * Return a callback that reports whether the component is still mounted.
 */
export function useIsMounted() {
  const isMountedRef = useRef(false)

  useEffect(() => {
    // Flag the ref as mounted on mount and clear it during cleanup.
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return useCallback(() => isMountedRef.current, [])
}
