import React, { useEffect, useState } from "react";
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

// Component to update map view
function MapUpdater({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
}

const MapComponent = ({ currentLocation, pickupLocation, dropoffLocation }) => {
  const [markers, setMarkers] = useState([]);
  const defaultCenter = [39.8283, -98.5795];

  useEffect(() => {
    const fetchCoordinates = async () => {
      const locations = [
        { address: currentLocation, label: "Current Location" },
        { address: pickupLocation, label: "Pickup Location" },
        { address: dropoffLocation, label: "Dropoff Location" },
      ].filter((loc) => loc.address); // Filter out empty addresses

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
    };

    if (currentLocation || pickupLocation || dropoffLocation) {
      fetchCoordinates();
    }
  }, [currentLocation, pickupLocation, dropoffLocation]);

  return (
    <div style={{ height: "400px", width: "100%", marginTop: "20px" }}>
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
        <MapUpdater coordinates={markers.map((m) => [m.lat, m.lng])} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
