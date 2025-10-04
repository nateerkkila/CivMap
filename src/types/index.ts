// A new type for our User model
export interface User {
  id: string;
  username: string;
  referralUserId?: string; // ID of the user who referred this user
  // In a real app, you would have a hashed password, not a plain one.
  // We'll omit it here since we are mocking auth.
}

export type ResourceType = 'Vehicle' | 'Generator' | 'Medical Skill' | 'Shelter' | 'Other';
export type ResourceStatus = 'Available' | 'Not Available';

export interface Resource {
  id: string;
  userId: string; // <-- Add the link to the user
  type: ResourceType;
  name: string;
  capacity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  status: ResourceStatus;
}