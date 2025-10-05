'use client';

import { useRouter } from 'next/navigation';
import { Item } from '@/types';
import { FaCar, FaBolt, FaFirstAid, FaHome, FaQuestionCircle, FaTruck, FaMedkit } from 'react-icons/fa';

const getResourceIcon = (categoryName: string | undefined) => {
  const iconProps = { className: "w-8 h-8 text-white" };
  switch (categoryName) {
    case 'Vehicle': return <FaCar {...iconProps} />;
    case 'Energy': return <FaBolt {...iconProps} />;
    case 'Medical': return <FaMedkit {...iconProps} />;
    case 'Shelter': return <FaHome {...iconProps} />;
    case 'Supply': return <FaTruck {...iconProps} />;
    case 'Labour': return <FaFirstAid {...iconProps} />;
    default: return <FaQuestionCircle {...iconProps} />;
  }
};

const ResourceCard = ({ item }: { item: Item }) => {
  const router = useRouter();
  const handleCardClick = () => router.push(`/manage-resource/${item.id}`);

  const categoryName = item.item_category?.name || 'Unknown';
  // With the new type, TypeScript knows availability_percent is a number or undefined.
  const availability = item.attributes?.availability_percent ?? 0;
  const isAvailable = availability > 0;

  const iconBgColor = isAvailable ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div
      onClick={handleCardClick}
      className="flex items-center p-4 transition-shadow duration-300 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md"
    >
      <div className={`flex items-center justify-center w-16 h-16 rounded-lg ${iconBgColor}`}>
        {getResourceIcon(categoryName)}
      </div>
      <div className="flex-1 ml-4 overflow-hidden">
        <h3 className="font-bold text-gray-800 truncate">{item.general_description}</h3>
        <p className="text-sm text-gray-600">{categoryName}</p>
        <span
          className={`inline-block px-2 py-0.5 mt-2 text-xs font-medium rounded-full ${
            isAvailable
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {availability}% Available
        </span>
      </div>
    </div>
  );
};

interface MyResourcesListProps {
  resources: Item[];
  loading: boolean;
  onRefresh: () => void;
}

export default function MyResourcesList({ resources, loading }: MyResourcesListProps) {
  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading your resources...</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <p>You have not registered any resources yet.</p>
        <p className="mt-1 text-sm">Click <strong>Add Resource</strong> to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((item) => (
        <ResourceCard key={item.id} item={item} />
      ))}
    </div>
  );
}