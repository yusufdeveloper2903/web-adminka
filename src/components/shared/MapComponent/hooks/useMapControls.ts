import { useImperativeHandle } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import type { MapComponentRef } from "../MapComponent"

export const useMapControls = (
  ref: React.ForwardedRef<MapComponentRef>,
  mapInstance: React.RefObject<H.Map | null>,
  debouncedResize: (map: H.Map) => void
) => {
  useImperativeHandle(
    ref,
    () => ({
      getMap: () => mapInstance.current,
      zoomIn: () => {
        if (mapInstance.current) {
          const currentZoom = mapInstance.current.getZoom()
          mapInstance.current.setZoom(Math.min(currentZoom + 1, 20))
        }
      },
      zoomOut: () => {
        if (mapInstance.current) {
          const currentZoom = mapInstance.current.getZoom()
          mapInstance.current.setZoom(Math.max(currentZoom - 1, 1))
        }
      },
      resize: () => {
        if (mapInstance.current) {
          debouncedResize(mapInstance.current)
        }
      }
    }),
    [debouncedResize]
  )
}
