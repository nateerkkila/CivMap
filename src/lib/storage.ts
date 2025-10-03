import { Resource } from "@/types";

const RESOURCES_KEY = 'civilian_resources';

// NOTE: These functions should only be called from client components.

/**
 * Retrieves all resources from localStorage.
 * @returns An array of Resource objects.
 */
export function getResources(): Resource[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const resources = localStorage.getItem(RESOURCES_KEY);
  return resources ? JSON.parse(resources) : [];
}

/**
 * Saves a new resource to localStorage.
 * @param resource - The Resource object to save.
 */
export function saveResource(resource: Resource): void {
  if (typeof window === 'undefined') {
    return;
  }
  const resources = getResources();
  resources.push(resource);
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
}