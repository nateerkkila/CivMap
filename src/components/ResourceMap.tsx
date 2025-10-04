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

interface FilterState {
  category: string;
  distance: string;
  maxDistance: number;
}

interface ResourceMapProps {
  filters?: FilterState;
  currentLocation?: { lat: number; lng: number } | null;
}

export default function ResourceMap({ filters, currentLocation }: ResourceMapProps = {}) {
  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize items when allItems first loads
  useEffect(() => {
    if (allItems.length > 0 && items.length === 0) {
      setItems(allItems);
    }
  }, [allItems, items.length]);

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
        setAllItems(itemsWithCounts as Item[]);
        // Don't set items here - let the filtering effect handle it
      }
    };
    fetchAllItems();
  }, []);

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Apply filters when filters, allItems, or currentLocation change
  useEffect(() => {
    if (!filters || !filters.category && !filters.distance) {
      // No filters applied - show all items
      setItems(allItems);
      return;
    }

    let filteredItems = [...allItems];

    // Filter by category
    if (filters.category) {
      filteredItems = filteredItems.filter(item => 
        item.item_category?.name === filters.category
      );
    }

    // Filter by distance
    if (filters.distance && currentLocation) {
      filteredItems = filteredItems.filter(item => {
        if (!item.lat || !item.lon) return false; // Skip items without coordinates
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          item.lat,
          item.lon
        );
        return distance <= filters.maxDistance;
      });
    }

    console.log('Filtering applied:', {
      allItemsCount: allItems.length,
      filteredItemsCount: filteredItems.length,
      filters,
      currentLocation
    });
    setItems(filteredItems);
  }, [filters, allItems, currentLocation]);
  
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

  console.log('Map render - items count:', items.length, 'validItems count:', validItems.length);

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
        <MarkerClusterGroup 
          key={`cluster-${validItems.length}`} 
          chunkedLoading
        >
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