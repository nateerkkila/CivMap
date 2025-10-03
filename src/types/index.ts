export type ResourceType = 'Vehicle' | 'Generator' | 'Medical Skill' | 'Shelter' | 'Other';
export type ResourceStatus = 'Available' | 'Not Available';

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  capacity: number;
  location: string; // Manual description, e.g., "Main St. Firehouse"
  latitude?: number;  // Latitude coordinate
  longitude?: number; // Longitude coordinate
  status: ResourceStatus;
}