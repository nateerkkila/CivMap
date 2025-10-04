export interface ItemCategory {
  id: number;
  name: string;
}

// A more specific interface for our JSONB attributes.
// We define known numeric keys and allow for other dynamic string keys.
export interface ItemAttributes {
  // Known numeric properties
  availability_percent?: number;
  capacity?: number;
  capacity_kw?: number;
  quantity?: number;

  // Allows for other, unknown properties to exist (e.g., vehicle_type, fuel_type)
  [key: string]: string | number | boolean | null | undefined;
}

export interface ItemInsert {
  user_id: string;
  category_id: number;
  general_description: string;
  address?: string;
  lat?: number;
  lon?: number;
  // Use our more specific type for insertions as well
  attributes?: ItemAttributes;
}

export interface Item {
  id: string;
  user_id: string;
  category_id: number;
  general_description: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  // Use the specific attributes type here
  attributes: ItemAttributes | null;
  created_at: string;
  item_category: {
    name: string;
  } | null;
}

// A new type for our User model
export interface User {
  id: string;
  username: string;
  referralUserId?: string;
  // In a real app, you would have a hashed password, not a plain one.
  // We'll omit it here since we are mocking auth.
}

export interface ThreatInsert {
  user_id: string;
  threat_type: string;
  description?: string;
  lat: number;
  lon: number;
}