// Represents a row in our public.item_category table
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

// Represents the object we will send to Supabase to insert a new item.
export interface ItemInsert {
  user_id: string;
  category_id: number;
  general_description: string;
  address?: string;
  lat?: number;
  lon?: number;
  attributes?: Record<string, any>; // For flexible JSONB data
}

// Represents a fully-fetched Item from Supabase, including the category name.
// This is what we will use most often in our components.
export interface Item {
  id: string; // UUID
  user_id: string; // UUID
  category_id: number;
  general_description: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  attributes: {
    capacity?: number;
    vehicle_type?: string;
    availability_percent?: number;
    // Add other potential attributes here as needed
  } | null;
  created_at: string; // Timestamp
  // This part comes from the joined item_category table
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