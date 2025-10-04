'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ItemCategory, ItemInsert } from '@/types';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-md"><p>Loading map...</p></div>,
});

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </label>
);

export default function RegisterResourceForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // --- State for ALL possible form fields ---
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [units, setUnits] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  
  // Shared fields
  const [availability, setAvailability] = useState(100);
  const [townArea, setTownArea] = useState('');
  const [sharePreciseLocation, setSharePreciseLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // UI State
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase.from('item_category').select('id, name').order('name');
      if (error) {
        setError('Could not load resource categories.');
      } else if (data) {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryName(data[0].name);
        }
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  const handleLocationChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) { setError("You must be logged in."); return; }
    const selectedCategory = categories.find(c => c.name === selectedCategoryName);
    if (!selectedCategory) { setError("Please select a valid resource type."); return; }

    setSubmitting(true);
    setError('');

    const attributes: Record<string, string | number | boolean | null> = { 
        availability_percent: availability 
    };
    let generalDesc = description;

    switch (selectedCategoryName) {
      case 'Vehicle':
      case 'Shelter':
        attributes.capacity = Number(capacity);
        generalDesc = description || `${selectedCategoryName} (Capacity: ${capacity})`;
        break;
      case 'Energy':
        attributes.capacity_kw = Number(capacity);
        attributes.fuel_type = fuelType;
        generalDesc = description || `${fuelType} Generator (${capacity}kW)`;
        break;
      case 'Supply':
      case 'Medical':
        attributes.quantity = Number(quantity);
        attributes.units = units;
        generalDesc = description || `${quantity} ${units} of Medical/Supply`;
        break;
      case 'Labour':
        attributes.skill_level = skillLevel;
        generalDesc = description || `Labour Skill: ${skillLevel}`;
        break;
    }

    const newItem: ItemInsert = {
      user_id: user.id,
      category_id: selectedCategory.id,
      general_description: generalDesc,
      address: townArea,
      lat: sharePreciseLocation ? coords?.lat : undefined,
      lon: sharePreciseLocation ? coords?.lng : undefined,
      attributes,
    };

    try {
      const { error: insertError } = await supabase.from('item').insert([newItem]);
      if (insertError) throw insertError;
      setSubmitted(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    // --- FIX: Type 'err' as 'unknown' and check its type ---
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Failed to save the resource.");
        }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-lg">
        <h3 className="text-xl font-medium text-green-800">Resource Saved Successfully!</h3>
        <p className="mt-2 text-green-700">Redirecting you to the dashboard...</p>
      </div>
    );
  }

  // --- Helper to render the dynamic fields ---
  const renderDynamicFields = () => {
    switch (selectedCategoryName) {
      case 'Vehicle':
      case 'Shelter':
        return (
          <>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">{selectedCategoryName === 'Vehicle' ? 'Seats' : 'Capacity (People)'}</label>
              <input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required min="0" className="block w-full text-gray-700 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">{selectedCategoryName === 'Vehicle' ? 'Vehicle Type / Specifics' : 'Shelter Specifics'}</label>
              <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Pickup truck, Minivan" className="block w-full text-gray-700 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500" />
            </div>
          </>
        );
      case 'Energy':
        return (
          <>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity (kW)</label>
              <input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required min="0" className="text-gray-700 block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">Fuel Type</label>
              <input id="fuelType" type="text" value={fuelType} onChange={(e) => setFuelType(e.target.value)} required placeholder="e.g., Gasoline, Diesel, Propane" className="text-gray-700 block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500" />
            </div>
          </>
        );
      case 'Supply':
      case 'Medical':
        return (
          <>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Item Name / Description</label>
              <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="e.g., Bottled Water, First-Aid Kits" className="block w-full text-gray-700 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required min="0" className="block w-full text-gray-700 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="units" className="block text-sm font-medium text-gray-700">Units</label>
                <input id="units" type="text" value={units} onChange={(e) => setUnits(e.target.value)} required placeholder="e.g., boxes, items" className="block w-full text-gray-700 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500" />
              </div>
            </div>
          </>
        );
      case 'Labour':
        return (
          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">Skill / Certification</label>
            <input id="skillLevel" type="text" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} required placeholder="e.g., EMT, Electrician, Plumber" className="text-gray-700 block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500" />
          </div>
        );
      default:
        return (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="block w-full px-3 py-2 mt-1 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">{error}</div>}
      
      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Resource Details</h2>
        <p className="mt-1 text-sm text-gray-600">Tell us what you can contribute to community resilience</p>
        <div className="mt-6 space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Resource Type</label>
            <select id="type" value={selectedCategoryName} onChange={(e) => setSelectedCategoryName(e.target.value)} disabled={loadingCategories} className="block w-full px-3 py-2 mt-1 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {loadingCategories ? <option>Loading...</option> : categories.map((cat) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
            </select>
          </div>
          
          {renderDynamicFields()}

          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
            <input id="availability" type="range" min="0" max="100" step="1" value={availability} onChange={(e) => setAvailability(Number(e.target.value))} className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Not available</span>
              <span>{availability}%</span>
              <span>Fully available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
         <h2 className="text-xl font-bold text-gray-900">Location</h2>
         <p className="mt-1 text-sm text-gray-600">Your location data is secure and can be shared as an approximate area</p>
         <div className="mt-6 space-y-6">
           <div className="flex items-center justify-between">
             <label htmlFor="share-precise" className="text-sm font-medium text-gray-700">Share precise location</label>
             <ToggleSwitch checked={sharePreciseLocation} onChange={setSharePreciseLocation} />
           </div>
           <div>
             <label htmlFor="townArea" className="block text-sm font-medium text-gray-700">Nearest town/area</label>
             <input id="townArea" type="text" value={townArea} onChange={(e) => setTownArea(e.target.value)} required placeholder="e.g., Keskusta, Helsinki" className="block w-full text-gray-700 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500" />
           </div>
           {sharePreciseLocation && (
             <div>
               <label className="block text-sm font-medium text-gray-700">Location on map</label>
               <div className="mt-2">
                 <MapPicker onLocationChange={handleLocationChange} />
               </div>
             </div>
           )}
         </div>
       </div>

      <div className="flex justify-end gap-4 pt-4">
        <Link href="/dashboard">
          <button type="button" className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
        </Link>
        <button type="submit" disabled={submitting || loadingCategories} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
          {submitting ? 'Saving...' : 'Save Resource'}
        </button>
      </div>
    </form>
  );
}