'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPaperPlane } from 'react-icons/fa';

// Fix for a known issue with the default icon path
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A sub-component to handle just the interactive marker
function LocationMarker({ onLocationChange, initialPosition }: { onLocationChange: (lat: number, lng: number) => void; initialPosition: LatLngExpression | null }) {
  // Initialize the marker's position directly from the prop. This only runs once.
  const [position, setPosition] = useState<LatLngExpression | null>(initialPosition);
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  // This effect allows the user to click on the map to change the marker's position
  useEffect(() => {
    map.on('click', (e) => {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    });
  }, [map, onLocationChange]);

  // Memoized event handlers for when the user finishes dragging the marker
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
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
      <Popup>Adjust location</Popup>
    </Marker>
  );
}

// The main MapPicker component
interface MapPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ onLocationChange }: MapPickerProps) {
  // We only need one state for the initial position now
  const [initialPosition, setInitialPosition] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map>(null);

  // On component mount, automatically get the user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos: LatLngExpression = [latitude, longitude];
        setInitialPosition(newPos);
        onLocationChange(latitude, longitude); // Inform the parent form immediately
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        // If user denies location, stop loading and show the map at a default location
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, [onLocationChange]);

  // Handler for the "Use my location" button to re-center the map
  const handleGeolocate = () => {
    if (mapRef.current) {
      mapRef.current.locate().on("locationfound", function (e) {
        mapRef.current?.flyTo(e.latlng, 14);
        // We don't need to update state here, just command the map to move
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-md">
        <p className="text-gray-500">Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* The MapContainer's 'center' prop now sets the INITIAL view. It is not controlled after this. */}
      <MapContainer
        center={initialPosition || [40.7128, -74.0060]} // Fallback to default if geolocation fails
        zoom={14}
        style={{ height: '300px', width: 's100%', borderRadius: '8px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker onLocationChange={onLocationChange} initialPosition={initialPosition} />
      </MapContainer>
      <button
        type="button"
        onClick={handleGeolocate}
        className="absolute z-[1000] top-3 right-3 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
        title="Recenter on my location"
      >
        <FaPaperPlane className="w-4 h-4 transform -rotate-45" />
        Use my location
      </button>
    </div>
  );
}