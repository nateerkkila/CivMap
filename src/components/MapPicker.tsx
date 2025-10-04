'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPaperPlane } from 'react-icons/fa'; // Updated Icon

// Fix for default icon issue with Webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  useEffect(() => {
    map.on('click', (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onLocationChange(e.latlng.lat, e.latlng.lng);
    });
  }, [map, onLocationChange]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onLocationChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onLocationChange],
  );

  return position === null ? null : (
    <Marker position={position} draggable={true} eventHandlers={eventHandlers} ref={markerRef}>
      <Popup>Resource Location</Popup>
    </Marker>
  );
}

interface MapPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ onLocationChange }: MapPickerProps) {
  const mapRef = useRef<L.Map>(null);

  const handleGeolocate = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      if (mapRef.current) {
        mapRef.current.flyTo([latitude, longitude], 13);
        onLocationChange(latitude, longitude);
      }
    });
  };

  return (
    <div className="relative">
      <MapContainer center={[51.505, -0.09]} zoom={10} style={{ height: '300px', width: '100%', borderRadius: '8px' }} ref={mapRef}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onLocationChange={onLocationChange} />
      </MapContainer>
      {/* --- UPDATED BUTTON --- */}
      <button
        type="button"
        onClick={handleGeolocate}
        className="absolute z-[1000] top-3 right-3 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
        title="Use my location"
      >
        <FaPaperPlane className="w-4 h-4 transform -rotate-45" />
        Use my location
      </button>
    </div>
  );
}