import { TripsMapView } from "../Trips/components"
import useRoutesHeader from "./hooks/useRoutesHeader"

const RoutesPage = () => {
  // Header Configuration Hook
  useRoutesHeader()

  return (
    <div className="relative h-full w-full">
      <TripsMapView isVisible={true} mapOnly={true} />
    </div>
  )
}

export default RoutesPage
