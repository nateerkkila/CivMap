export interface ItemCategory {
  id: number;
  name: string;
}

// Represents user profile data from the profiles table
export interface UserProfile {
  id: string;
  username: string;
  total_score: number;
  security_level: number;
  referral_user_id?: string;
  last_confirmed_at?: string;
  created_at: string;
  updated_at: string;
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

export interface Profile {
  id: string; // UUID
  username: string;
  profession: string | null;
  availability_notes: string | null;
  reliability_score: number | null;
  registered_address: string | null;
  phone: string | null;
}

export interface Item {
  id: string; // UUID
  user_id: string; // UUID
  general_description: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  attributes: ItemAttributes | null;
  created_at: string; // Timestamp
  // Joined Data
  item_category: { name: string; } | null;
  // We now join the entire profile object
  profiles: Profile | null;
  // Vote/comment counts
  upvotes: number;
  downvotes: number;
  comment_count: number;
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