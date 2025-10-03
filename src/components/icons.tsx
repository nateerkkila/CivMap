import L from 'leaflet';
import { ResourceType } from '@/types';

// Using L.DivIcon allows us to use HTML/SVG, which is more flexible.
const createIcon = (svg: string, className: string) => {
  return L.divIcon({
    html: svg,
    className: `custom-leaflet-icon ${className}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const vehicleSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></svg>`;
const generatorSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M20 19V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v12H2v2h20v-2h-2zM6 7h12v3H6V7zm0 5h5v2H6v-2zm0 3h5v2H6v-2zm7 0h5v5h-5v-5z"></path></svg>`;
const medicalSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"></path></svg>`;
const shelterSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"></path></svg>`;
const otherSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>`;

const icons = {
  Vehicle: createIcon(vehicleSVG, 'icon-vehicle'),
  Generator: createIcon(generatorSVG, 'icon-generator'),
  'Medical Skill': createIcon(medicalSVG, 'icon-medical'),
  Shelter: createIcon(shelterSVG, 'icon-shelter'),
  Other: createIcon(otherSVG, 'icon-other'),
};

export const getIconForResourceType = (type: ResourceType) => {
  return icons[type] || icons.Other;
};