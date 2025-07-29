import { useState, useEffect, useCallback } from "react"

interface UseLazyViewOptions {
  loadingDelay?: number
  preload?: boolean
  onLoadStart?: () => void
  onLoadComplete?: () => void
}

export const useLazyView = (currentView: string, targetView: string, options: UseLazyViewOptions = {}) => {
  const { loadingDelay = 100, preload = false, onLoadStart, onLoadComplete } = options

  const [hasBeenViewed, setHasBeenViewed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Check if this view should be loaded
  const shouldLoad = currentView === targetView || preload

  // Load the view when first accessed
  useEffect(() => {
    if (shouldLoad && !hasBeenViewed) {
      setIsLoading(true)
      setHasBeenViewed(true)
      onLoadStart?.()

      const timer = setTimeout(() => {
        setIsLoading(false)
        setIsReady(true)
        onLoadComplete?.()
      }, loadingDelay)

      return () => clearTimeout(timer)
    }
  }, [shouldLoad, hasBeenViewed, loadingDelay, onLoadStart, onLoadComplete])

  // Force load the view (useful for preloading)
  const forceLoad = useCallback(() => {
    if (!hasBeenViewed) {
      setIsLoading(true)
      setHasBeenViewed(true)
      onLoadStart?.()

      setTimeout(() => {
        setIsLoading(false)
        setIsReady(true)
        onLoadComplete?.()
      }, loadingDelay)
    }
  }, [hasBeenViewed, loadingDelay, onLoadStart, onLoadComplete])

  return {
    // States
    hasBeenViewed,
    isLoading,
    isReady,
    shouldRender: hasBeenViewed,
    isActive: currentView === targetView,

    // Actions
    forceLoad,

    // Computed
    showPlaceholder: !hasBeenViewed && currentView === targetView
  }
}
