import L from 'leaflet';
// We no longer need to import types from the types file here.

// This function creates a flexible DivIcon that uses SVG.
const createIcon = (svg: string, className: string) => {
  return L.divIcon({
    html: svg,
    className: `custom-leaflet-icon ${className}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Define the SVG strings for each icon
const vehicleSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></svg>`;
const energySVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M20 19V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v12H2v2h20v-2h-2zM6 7h12v3H6V7zm0 5h5v2H6v-2zm0 3h5v2H6v-2zm7 0h5v5h-5v-5z"></path></svg>`;
const medicalSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"></path></svg>`;
const shelterSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"></path></svg>`;
const labourSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M14.5 12c1.38 0 2.5-1.12 2.5-2.5S15.88 7 14.5 7 12 8.12 12 9.5s1.12 2.5 2.5 2.5zM9.5 12c1.38 0 2.5-1.12 2.5-2.5S10.88 7 9.5 7 7 8.12 7 9.5s1.12 2.5 2.5 2.5zM12 14c-1.67 0-5 1-5 2.5V18h10v-1.5c0-1.5-3.33-2.5-5-2.5z"></path></svg>`;
const supplySVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-8.5l1.96 2.5H17V9.5h2.5zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path></svg>`;
const otherSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>`;
const threatSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.74a3 3 0 01-2.598 4.502H4.644a3 3 0 01-2.598-4.502L9.4 3.003zM12 16a1 1 0 100-2 1 1 0 000 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H12a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`;



// Map the SVG strings to their respective class names for styling
const icons = {
  Vehicle: createIcon(vehicleSVG, 'icon-vehicle'),
  Energy: createIcon(energySVG, 'icon-energy'),
  Labour: createIcon(labourSVG, 'icon-labour'),
  Supply: createIcon(supplySVG, 'icon-supply'),
  Shelter: createIcon(shelterSVG, 'icon-shelter'),
  Medical: createIcon(medicalSVG, 'icon-medical'),
  Other: createIcon(otherSVG, 'icon-other'),
  Threat: createIcon(threatSVG, 'icon-threat'),
};

export const getIconForThreat = (): L.DivIcon => {
  return icons.Threat;
};

export const getIconForResourceType = (type: string | undefined): L.DivIcon => {
  // Use a type assertion to safely access the icons object.
  // If the type is undefined or doesn't match, it will fall back to the 'Other' icon.
  return icons[type as keyof typeof icons] || icons.Other;
};