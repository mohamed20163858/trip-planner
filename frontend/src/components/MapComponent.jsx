import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { geocodeAddress } from "../services/geocoding";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RouteLayer = React.memo(({ markers, onRouteDrawn }) => {
  const map = useMap();
  console.log("RouteLayer - Rendering with markers:", markers);

  useEffect(() => {
    console.log("RouteLayer - Effect triggered with markers:", markers);
    let polyline = null;

    if (markers.length >= 2) {
      console.log("RouteLayer - Drawing route for markers");
      const waypoints = markers.map((marker) =>
        L.latLng(marker.lat, marker.lng)
      );
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [50, 50] });

      polyline = L.polyline(waypoints, { color: "blue", weight: 3 }).addTo(map);

      let totalDistance = 0;
      for (let i = 0; i < markers.length - 1; i++) {
        totalDistance += calculateDistance(
          markers[i].lat,
          markers[i].lng,
          markers[i + 1].lat,
          markers[i + 1].lng
        );
      }

      console.log("RouteLayer - Calculated total distance:", totalDistance);
      // Only call onRouteDrawn if the distance has changed
      onRouteDrawn(totalDistance);
    }

    return () => {
      if (polyline) {
        console.log("RouteLayer - Cleaning up polyline");
        map.removeLayer(polyline);
      }
    };
  }, [markers, map, onRouteDrawn]);

  return null;
});

const MapComponent = React.memo(
  ({ currentLocation, pickupLocation, dropoffLocation, onRouteCalculated }) => {
    const [markers, setMarkers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const defaultCenter = useMemo(() => [39.8283, -98.5795], []);
    const mountedRef = useRef(true);

    const locations = useMemo(() => {
      return [
        { address: currentLocation, label: "Current Location" },
        { address: pickupLocation, label: "Pickup Location" },
        { address: dropoffLocation, label: "Dropoff Location" },
      ].filter((loc) => loc.address);
    }, [currentLocation, pickupLocation, dropoffLocation]);

    const handleRouteDrawn = useCallback(
      (distance) => {
        console.log(
          "MapComponent - handleRouteDrawn called with distance:",
          distance
        );
        onRouteCalculated(distance);
      },
      [onRouteCalculated]
    );

    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    useEffect(() => {
      if (locations.length === 0) return;

      console.log("MapComponent - Effect triggered for locations");
      setIsLoading(true);

      const geocodeCache = new Map();

      const fetchCoordinates = async () => {
        try {
          const coordinates = [];

          for (const location of locations) {
            if (!mountedRef.current) return;

            if (geocodeCache.has(location.address)) {
              coordinates.push({
                ...geocodeCache.get(location.address),
                label: location.label,
                address: location.address,
              });
              continue;
            }

            console.log("MapComponent - Geocoding address:", location.address);
            const coords = await geocodeAddress(location.address);

            if (coords && mountedRef.current) {
              geocodeCache.set(location.address, coords);
              coordinates.push({
                ...coords,
                label: location.label,
                address: location.address,
              });
            }
          }

          if (mountedRef.current) {
            console.log("MapComponent - Setting markers:", coordinates);
            setMarkers(coordinates);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("MapComponent - Error fetching coordinates:", error);
          if (mountedRef.current) {
            setIsLoading(false);
          }
        }
      };

      fetchCoordinates();
    }, [locations]);

    return (
      <div
        style={{
          height: "400px",
          width: "100%",
          marginTop: "20px",
          position: "relative",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
          >
            Loading locations...
          </div>
        )}
        <MapContainer
          center={defaultCenter}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markers.map((marker, index) => (
            <Marker key={index} position={[marker.lat, marker.lng]}>
              <Popup>
                <strong>{marker.label}</strong>
                <br />
                {marker.address}
              </Popup>
            </Marker>
          ))}
          <RouteLayer markers={markers} onRouteDrawn={handleRouteDrawn} />
        </MapContainer>
      </div>
    );
  }
);

export default MapComponent;
