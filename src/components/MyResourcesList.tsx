'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getResourcesForUser, getCurrentUser } from '@/lib/storage';
import { Resource, ResourceType } from '@/types';
import { FaCar, FaBolt, FaFirstAid, FaHome, FaQuestionCircle } from 'react-icons/fa';

// Helper function to get an icon based on resource type
const getResourceIcon = (type: ResourceType) => {
  const iconProps = { className: "w-8 h-8 text-white" };
  switch (type) {
    case 'Vehicle':
      return <FaCar {...iconProps} />;
    case 'Generator':
      return <FaBolt {...iconProps} />;
    case 'Medical Skill':
      return <FaFirstAid {...iconProps} />;
    case 'Shelter':
      return <FaHome {...iconProps} />;
    default:
      return <FaQuestionCircle {...iconProps} />;
  }
};

// The individual card component
const ResourceCard = ({ resource }: { resource: Resource }) => {
  const router = useRouter();

  const handleCardClick = () => {
    // Navigate to a dynamic route for managing this specific resource
    router.push(`/manage-resource/${resource.id}`);
  };

  const iconBgColor = resource.status === 'Available' ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div
      onClick={handleCardClick}
      className="flex items-center p-4 transition-shadow duration-300 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md"
    >
      <div className={`flex items-center justify-center w-16 h-16 rounded-lg ${iconBgColor}`}>
        {getResourceIcon(resource.type)}
      </div>
      <div className="flex-1 ml-4">
        <h3 className="font-bold text-gray-800 truncate">{resource.name}</h3>
        <p className="text-sm text-gray-600">{resource.type}</p>
        <span
          className={`inline-block px-2 py-0.5 mt-2 text-xs font-medium rounded-full ${
            resource.status === 'Available'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {resource.status}
        </span>
      </div>
    </div>
  );
};

// The main component that fetches and displays the list of cards
export default function MyResourcesList() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Fetch resources specifically for this user
      setResources(getResourcesForUser(currentUser.id));
    }
  }, []);

  if (resources.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <p>You have not registered any resources yet.</p>
        <p className="mt-1 text-sm">Click "Register a Resource" to add your first one.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}