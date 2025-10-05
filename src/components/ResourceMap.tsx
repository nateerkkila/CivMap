'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/lib/supabaseClient';
import { Item, ThreatInsert } from '@/types';
import { getIconForResourceType, getIconForThreat } from './icons';
import { FaLocationArrow } from 'react-icons/fa';
import ResourceDetailPanel from './ResourceDetailPanel';

// --- Define Types and Props ---
type Threat = ThreatInsert & { created_at: string, id: string };
interface FilterState {
  category: string;
  distance: string;
  maxDistance: number;
}
interface ResourceMapProps {
  filters?: FilterState;
  currentLocation?: { lat: number; lng: number } | null;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export default function ResourceMap({ filters, currentLocation }: ResourceMapProps = {}) {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allThreats, setAllThreats] = useState<Threat[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Effect to fetch ALL data once
  useEffect(() => {
    const fetchMapData = async () => {
      const [itemsRes, threatsRes] = await Promise.all([
        supabase.from('item').select(`*, item_category(name), profiles(*)`),
        supabase.from('threats').select(`*`)
      ]);
      if (itemsRes.data) setAllItems(itemsRes.data as Item[]);
      if (threatsRes.data) setAllThreats(threatsRes.data as Threat[]);
    };
    fetchMapData();
  }, []);

  // Effect to apply filters to items
  useEffect(() => {
    let newFilteredItems = [...allItems];
    if (filters?.category) {
      newFilteredItems = newFilteredItems.filter(item => item.item_category?.name === filters.category);
    }
    if (filters?.distance && currentLocation) {
      newFilteredItems = newFilteredItems.filter(item => {
        if (!item.lat || !item.lon) return false;
        const distance = calculateDistance(currentLocation.lat, currentLocation.lng, item.lat, item.lon);
        return distance <= filters.maxDistance;
      });
    }
    setFilteredItems(newFilteredItems);
  }, [filters, currentLocation, allItems]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) { map.on('click', () => setSelectedItem(null)); }
    return () => { map?.off('click'); };
  }, [mapRef]);

  const validItems = filteredItems.filter(item => typeof item.lat === 'number' && typeof item.lon === 'number');
  const validThreats = allThreats.filter(threat => typeof threat.lat === 'number' && typeof threat.lon === 'number');

  const handleMarkerClick = (item: Item) => {
    setSelectedItem(prev => (prev && prev.id === item.id ? null : item));
    mapRef.current?.flyTo([item.lat!, item.lon!], 15);
  };

  const goToMyLocation = () => mapRef.current?.locate({ setView: true, maxZoom: 14 });
  useEffect(() => { const timer = setTimeout(goToMyLocation, 500); return () => clearTimeout(timer); }, []);

  return (
    <div className="relative w-full h-full">
      <ResourceDetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
      <MapContainer center={[60.1699, 24.9384]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} ref={mapRef}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        <MarkerClusterGroup key={`cluster-${validItems.length}`} chunkedLoading>
          {validItems.map((item) => (
            <Marker key={item.id} position={[item.lat!, item.lon!]} icon={getIconForResourceType(item.item_category?.name)} eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); handleMarkerClick(item); } }}/>
          ))}
        </MarkerClusterGroup>

        {/* --- NEW: Render Threat Markers --- */}
        {validThreats.map((threat) => (
          <Marker key={threat.id} position={[threat.lat, threat.lon]} icon={getIconForThreat()} zIndexOffset={1000}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-md text-red-700">{threat.threat_type}</h3>
                {threat.description && <p className="mt-1 text-sm text-gray-800">{threat.description}</p>}
                <p className="mt-2 text-xs text-gray-500">Reported: {new Date(threat.created_at).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <button onClick={goToMyLocation} className="absolute z-[999] bottom-5 right-5 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-100" title="Go to my location">
        <FaLocationArrow className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}