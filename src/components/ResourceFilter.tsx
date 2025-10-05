'use client';

import { useState, useEffect } from 'react';

interface FilterState {
  category: string;
  distance: string;
  maxDistance: number;
}

interface ResourceFilterProps {
  categories: { id: number; name: string }[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
  onLocationError: (error: string) => void;
  currentLocation: { lat: number; lng: number } | null;
  locationError: string;
}

export default function ResourceFilter({
  categories,
  filters,
  onFiltersChange,
  onLocationChange,
  onLocationError,
  currentLocation,
  locationError
}: ResourceFilterProps) {
  // Function to get current location from GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      onLocationError('Geolocation is not supported by this browser.');
      return;
    }

    onLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        onLocationChange(location);
        onFiltersChange({ ...filters, distance: 'gps' });
      },
      (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            onLocationError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            onLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            onLocationError('Location request timed out.');
            break;
          default:
            onLocationError('An unknown error occurred.');
            break;
        }
      }
    );
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string | number) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const handleDistanceChange = (value: string) => {
    if (value === 'gps') {
      getCurrentLocation();
    } else {
      onFiltersChange({ ...filters, distance: value });
    }
  };

  const handleManualLocation = (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onLocationChange({ lat: latNum, lng: lngNum });
      onFiltersChange({ ...filters, distance: 'manual' });
      onLocationError('');
    } else {
      onLocationError('Invalid coordinates');
    }
  };

  const clearFilters = () => {
    onFiltersChange({ category: '', distance: '', maxDistance: 50 });
    onLocationChange(null);
    onLocationError('');
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Resource Type</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 text-sm text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Distance Filter</label>
          <select
            value={filters.distance}
            onChange={(e) => handleDistanceChange(e.target.value)}
            className="px-3 py-2 text-sm text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            <option value="gps">Use GPS Location</option>
            <option value="manual">Manual Coordinates</option>
          </select>
        </div>

        {filters.distance && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Distance (km)</label>
            <input
              type="number"
              value={filters.maxDistance}
              onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
              min="1"
              max="1000"
              className="px-3 py-2 text-sm text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
            />
          </div>
        )}

        {filters.distance === 'manual' && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Coordinates</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                className="px-3 py-2 text-sm text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                onBlur={(e) => {
                  const lat = e.target.value;
                  const lngInput = document.querySelector('input[placeholder="Longitude"]') as HTMLInputElement;
                  if (lngInput && lat) {
                    handleManualLocation(lat, lngInput.value);
                  }
                }}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                className="px-3 py-2 text-sm text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                onBlur={(e) => {
                  const lng = e.target.value;
                  const latInput = document.querySelector('input[placeholder="Latitude"]') as HTMLInputElement;
                  if (latInput && lng) {
                    handleManualLocation(latInput.value, lng);
                  }
                }}
              />
            </div>
          </div>
        )}

        {currentLocation && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Location</label>
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
          </div>
        )}
        
        {(filters.category || filters.distance) && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {locationError && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {locationError}
        </div>
      )}
    </div>
  );
}
