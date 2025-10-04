'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Item } from '@/types';
import { FaCar, FaBolt, FaFirstAid, FaHome, FaQuestionCircle, FaTruck, FaMedkit, FaUser } from 'react-icons/fa';
import ResourceFilter from '@/components/ResourceFilter';

// Updated helper to match new categories
const getResourceIcon = (categoryName: string | undefined) => {
  const iconProps = { className: "w-8 h-8 text-white" };
  switch (categoryName) {
    case 'Vehicle': return <FaCar {...iconProps} />;
    case 'Energy': return <FaBolt {...iconProps} />;
    case 'Medical': return <FaMedkit {...iconProps} />;
    case 'Shelter': return <FaHome {...iconProps} />;
    case 'Supply': return <FaTruck {...iconProps} />;
    case 'Labour': return <FaFirstAid {...iconProps} />;
    default: return <FaQuestionCircle {...iconProps} />;
  }
};

// The individual card component for all resources
const AllResourceCard = ({ item }: { item: Item & { owner_username?: string } }) => {
  const router = useRouter();
  const handleCardClick = () => router.push(`/manage-resource/${item.id}`);

  const categoryName = item.item_category?.name || 'Unknown';
  const availability = item.attributes?.availability_percent ?? 0;
  const isAvailable = availability > 0;

  const iconBgColor = isAvailable ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div
      onClick={handleCardClick}
      className="flex items-center p-4 transition-shadow duration-300 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md"
    >
      <div className={`flex items-center justify-center w-16 h-16 rounded-lg ${iconBgColor}`}>
        {getResourceIcon(categoryName)}
      </div>
      <div className="flex-1 ml-4 overflow-hidden">
        <h3 className="font-bold text-gray-800 truncate">{item.general_description}</h3>
        <p className="text-sm text-gray-600">{categoryName}</p>
        {item.owner_username && (
          <p className="text-xs text-gray-500 flex items-center mt-1">
            <FaUser className="w-3 h-3 mr-1" />
            {item.owner_username}
          </p>
        )}
        <span
          className={`inline-block px-2 py-0.5 mt-2 text-xs font-medium rounded-full ${
            isAvailable
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {availability}% Available
        </span>
      </div>
    </div>
  );
};

// The main component that fetches all resources from all users
export default function AllResourcesList() {
  const [items, setItems] = useState<(Item & { owner_username?: string })[]>([]);
  const [allItems, setAllItems] = useState<(Item & { owner_username?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    distance: '',
    maxDistance: 50 // km
  });
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');

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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('item_category')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, []);

  // Fetch all items
  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);

      try {
        // First, fetch all items with categories
        const { data: itemsData, error: itemsError } = await supabase
          .from('item')
          .select(`
            *,
            item_category ( name )
          `)
          .order('created_at', { ascending: false });

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          setLoading(false);
          return;
        }

        if (!itemsData || itemsData.length === 0) {
          setItems([]);
          setAllItems([]);
          setLoading(false);
          return;
        }

        // Get unique user IDs from items
        const userIds = [...new Set(itemsData.map(item => item.user_id))];
        
        // Fetch user profiles for all unique user IDs
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Continue without owner names if profiles fetch fails
          const transformedData = itemsData as (Item & { owner_username?: string })[];
          setItems(transformedData);
          setAllItems(transformedData);
        } else {
          // Create a map of user_id to username
          const userMap = new Map(profilesData?.map(profile => [profile.id, profile.username]) || []);
          
          // Transform the data to include owner_username
          const transformedData = itemsData.map(item => ({
            ...item,
            owner_username: userMap.get(item.user_id) || 'Unknown User'
          }));
          
          setItems(transformedData);
          setAllItems(transformedData);
        }
      } catch (error) {
        console.error('Error in fetchAllItems:', error);
      }
      
      setLoading(false);
    };

    fetchAllItems();
  }, []);

  // Apply filters when filters or allItems change
  useEffect(() => {
    let filteredItems = [...allItems];

    // Filter by category
    if (filters.category) {
      filteredItems = filteredItems.filter(item => 
        item.item_category?.name === filters.category
      );
    }

    // Filter by distance
    if (filters.distance === 'gps' && currentLocation) {
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
    } else if (filters.distance === 'manual' && currentLocation) {
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

    setItems(filteredItems);
  }, [filters, allItems, currentLocation]);


  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading all resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Community Resources</h2>
        <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
          {items.length} of {allItems.length} resources
        </span>
      </div>
      
      <ResourceFilter
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
        onLocationChange={setCurrentLocation}
        onLocationError={setLocationError}
        currentLocation={currentLocation}
        locationError={locationError}
      />
      
      {/* Results Section */}
      {items.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {allItems.length === 0 ? (
            <p>No resources have been registered yet.</p>
          ) : (
            <p>No resources match the selected filter.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AllResourceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
