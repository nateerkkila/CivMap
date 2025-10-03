'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet'; // Import Leaflet library
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { getResources } from '@/lib/storage';
import { Resource } from '@/types';
import { getIconForResourceType } from './icons';
import { FaLocationArrow } from 'react-icons/fa'; // Icon for the button

export default function ResourceMap() {
  const [resources, setResources] = useState<Resource[]>([]);
  const mapRef = useRef<L.Map | null>(null); // Create a ref to hold the map instance

  useEffect(() => {
    setResources(getResources());
  }, []);

  // Function to handle centering the map on the user's location
  const goToMyLocation = () => {
    const map = mapRef.current;
    if (map) {
      map.locate({ setView: true, maxZoom: 14 }); // Leaflet's built-in locate method
    }
  };

  // On initial component mount, try to go to the user's location
  useEffect(() => {
    // We wrap this in a small timeout to ensure the map container has initialized
    const timer = setTimeout(() => {
      goToMyLocation();
    }, 500);

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  const validResources = resources.filter(
    (resource) =>
      typeof resource.latitude === 'number' &&
      typeof resource.longitude === 'number'
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[40.7128, -74.0060]} // Default center if geolocation fails
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        ref={mapRef} // Assign the ref to the map container
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {validResources.map((resource) => (
            <Marker
              key={resource.id}
              position={[resource.latitude!, resource.longitude!]}
              icon={getIconForResourceType(resource.type)}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{resource.name}</h3>
                  <p><strong>Type:</strong> {resource.type}</p>
                  <p><strong>Capacity:</strong> {resource.capacity}</p>
                  <p><strong>Status:</strong> <span className={resource.status === 'Available' ? 'text-green-600' : 'text-red-600'}>{resource.status}</span></p>
                  {resource.location && <p className="text-sm italic text-gray-500">{resource.location}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      
      {/* --- NEW "GO TO MY LOCATION" BUTTON --- */}
      <button
        onClick={goToMyLocation}
        className="absolute z-[1000] bottom-5 right-5 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100"
        title="Go to my location"
      >
        <FaLocationArrow className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}