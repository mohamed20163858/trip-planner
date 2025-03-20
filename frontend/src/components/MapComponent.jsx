import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { geocodeAddress } from "../services/geocoding";

// Fix for default marker icon (keep existing code)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Routing Machine Component
function RoutingMachine({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!map || coordinates.length < 2) return;

    const waypoints = coordinates.map((coord) =>
      L.latLng(coord.lat, coord.lng)
    );

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#6FA1EC", weight: 4 }],
      },
      createMarker: function () {
        return null;
      }, // Don't create default markers
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, coordinates]);

  return null;
}

const MapComponent = ({ currentLocation, pickupLocation, dropoffLocation }) => {
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const defaultCenter = [39.8283, -98.5795];

  useEffect(() => {
    const fetchCoordinates = async () => {
      setIsLoading(true);
      const locations = [
        { address: currentLocation, label: "Current Location" },
        { address: pickupLocation, label: "Pickup Location" },
        { address: dropoffLocation, label: "Dropoff Location" },
      ].filter((loc) => loc.address);

      const coordinates = [];

      for (const location of locations) {
        if (location.address) {
          const coords = await geocodeAddress(location.address);
          if (coords) {
            coordinates.push({
              ...coords,
              label: location.label,
              address: location.address,
            });
          }
        }
      }

      setMarkers(coordinates);
      setIsLoading(false);
    };

    if (currentLocation || pickupLocation || dropoffLocation) {
      fetchCoordinates();
    }
  }, [currentLocation, pickupLocation, dropoffLocation]);

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
          Loading locations and calculating route...
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
        {markers.length >= 2 && <RoutingMachine coordinates={markers} />}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
