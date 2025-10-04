'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/lib/supabaseClient';
import { Item } from '@/types';
import { getIconForResourceType } from './icons';
import { FaLocationArrow } from 'react-icons/fa';

export default function ResourceMap() {
  const [items, setItems] = useState<Item[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      // Fetch all items and join with the category table to get the category name
      const { data, error } = await supabase
        .from('item')
        .select(`
          *,
          item_category ( name )
        `);

      if (error) {
        console.error("Error fetching all items for map:", error);
      } else {
        // Cast the fetched data to our specific Item[] type
        setItems(data as Item[]);
      }
    };
    fetchAllItems();
  }, []);

  const goToMyLocation = () => {
    mapRef.current?.locate({ setView: true, maxZoom: 14 });
  };

  // Center the map on the user's location when it first loads
  useEffect(() => {
    const timer = setTimeout(() => goToMyLocation(), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter out any items that don't have valid coordinates
  const validItems = items.filter(
    (item) => typeof item.lat === 'number' && typeof item.lon === 'number'
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer center={[40.7128, -74.0060]} zoom={5} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {validItems.map((item) => {
            // Safely get the availability percentage. TypeScript now knows this is a number.
            // If `attributes` or `availability_percent` is missing, it defaults to 0.
            const availability = item.attributes?.availability_percent ?? 0;
            const isAvailable = availability > 0;
            
            return (
              <Marker
                key={item.id}
                position={[item.lat!, item.lon!]}
                icon={getIconForResourceType(item.item_category?.name)}
              >
                <Popup>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">{item.general_description}</h3>
                    <p><strong>Type:</strong> {item.item_category?.name || 'N/A'}</p>
                    
                    {/* Safely access capacity, which is also now known to be a number */}
                    {item.attributes?.capacity != null && <p><strong>Capacity:</strong> {item.attributes.capacity}</p>}
                    
                    <p>
                      <strong>Availability:</strong>
                      <span className={isAvailable ? 'text-green-600' : 'text-red-600'}>
                        {' '}{availability}%
                      </span>
                    </p>

                    {item.address && <p className="text-sm italic text-gray-500">{item.address}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
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