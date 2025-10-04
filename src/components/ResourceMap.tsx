'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// --- UPDATED IMPORT ---
// We now import the new function for getting all resources.
import { getAllResources } from '@/lib/storage';
import { Resource } from '@/types';
import { getIconForResourceType } from './icons';
import { FaLocationArrow } from 'react-icons/fa';

export default function ResourceMap() {
  const [resources, setResources] = useState<Resource[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // --- UPDATED DATA FETCHING LOGIC ---
  useEffect(() => {
    // This now fetches ALL resources for the global map view.
    setResources(getAllResources());
  }, []); // This effect still runs once when the component mounts

  const goToMyLocation = () => {
    const map = mapRef.current;
    if (map) {
      map.locate({ setView: true, maxZoom: 14 });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      goToMyLocation();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const validResources = resources.filter(
    (resource) =>
      typeof resource.latitude === 'number' &&
      typeof resource.longitude === 'number'
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[40.7128, -74.0060]}
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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