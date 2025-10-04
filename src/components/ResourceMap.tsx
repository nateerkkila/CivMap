'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/lib/supabaseClient';
import { Item } from '@/types';
import { getIconForResourceType } from './icons';
import { FaLocationArrow } from 'react-icons/fa';
import ResourceDetailPanel from './ResourceDetailPanel';

export default function ResourceMap() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      // --- THE KEY CHANGE IS HERE: "profiles(*)" ---
      // This tells Supabase to fetch all columns from the related profiles table.
      const { data, error } = await supabase
        .from('item')
        .select(`
          *,
          item_category ( name ),
          profiles ( * )
        `);

      if (error) {
        console.error("Error fetching items for map:", error);
      } else {
        const itemsWithCounts = data.map(item => ({
          ...item,
          upvotes: 0,
          downvotes: 0,
          comment_count: 0,
        }));
        setItems(itemsWithCounts as Item[]);
      }
    };
    fetchAllItems();
  }, []);
  
  // --- NEW LOGIC for closing the panel when clicking on the map ---
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.on('click', () => {
        setSelectedItem(null); // Close the panel
      });
    }
    // Cleanup function to remove the event listener
    return () => {
      map?.off('click');
    };
  }, [mapRef]);

  const validItems = items.filter(
    (item) => typeof item.lat === 'number' && typeof item.lon === 'number'
  );

  // --- UPDATED LOGIC to toggle the panel on marker clicks ---
  const handleMarkerClick = (item: Item) => {
    // If the clicked marker is already the selected one, close the panel. Otherwise, open it.
    setSelectedItem(prev => (prev && prev.id === item.id ? null : item));
    mapRef.current?.flyTo([item.lat!, item.lon!], 15);
  };

  const goToMyLocation = () => {
    mapRef.current?.locate({ setView: true, maxZoom: 14 });
  };

  useEffect(() => {
    const timer = setTimeout(() => goToMyLocation(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full">
      <ResourceDetailPanel 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
      
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
          {validItems.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat!, item.lon!]}
              icon={getIconForResourceType(item.item_category?.name)}
              eventHandlers={{
                click: (e) => {
                  // Stop the click from propagating to the map, which would instantly close the panel
                  L.DomEvent.stopPropagation(e);
                  handleMarkerClick(item);
                },
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      
      <button 
        onClick={goToMyLocation} 
        className="absolute z-[999] bottom-5 right-5 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100" 
        title="Go to my location"
      >
        <FaLocationArrow className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}