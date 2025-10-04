'use client';

import { Item } from "@/types";
import { FaTimes, FaMapPin, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { format } from 'date-fns';

interface ResourceDetailPanelProps {
  item: Item | null;
  onClose: () => void;
}

export default function ResourceDetailPanel({ item, onClose }: ResourceDetailPanelProps) {
  if (!item) {
    return null;
  }

  const formattedDate = format(new Date(item.created_at), 'P');

  return (
    // --- STYLING OVERHAUL ---
    // Inset from edges, rounded corners, shadow, and max-height for scrolling
    <div className="absolute top-4 left-4 z-[1000] w-[400px] max-w-[90vw] bg-white rounded-lg shadow-xl flex flex-col max-h-[calc(100vh-2rem)]">
      
      {/* Panel Header */}
      <div className="flex-shrink-0 p-4 border-b">
        {/* The design uses a "Back" button, which we'll map to our close function */}
        <button onClick={onClose} className="text-indigo-600 font-semibold hover:text-indigo-800">
          &larr; Back to Map
        </button>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <p className="flex items-center text-sm text-gray-500">
            <FaMapPin className="mr-2 flex-shrink-0" /> {item.address || 'Precise location on map'}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{item.general_description}</h1>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-200 mr-3"></div> {/* Avatar Placeholder */}
            <div>
              <p className="font-semibold text-gray-800">{item.profiles?.username || 'Anonymous'}</p>
              <p>{formattedDate}</p>
            </div>
          </div>
          {/* Voting Section Placeholder */}
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex items-center gap-1 cursor-pointer hover:text-green-600">
              <FaThumbsUp />
              <span>{item.upvotes}</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-red-600">
              <FaThumbsDown />
              <span>{item.downvotes}</span>
            </div>
          </div>
        </div>

        {/* Long Description / Attributes */}
        <div className="prose prose-sm max-w-none text-gray-700 mb-6 border-b pb-6">
          {/* We can add more detailed descriptions here later */}
          <p>
            A more detailed description or breakdown of the resource's attributes would go here. For now, this is a placeholder.
          </p>
        </div>

        {/* Comments Section Placeholder */}
        <div>
          <p className="text-center text-gray-500 italic">No comments yet...</p>
        </div>
      </div>

      {/* Comment Input Form (Sticky Footer) */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex items-center gap-3">
          <textarea
            placeholder="What do you think?"
            rows={1}
            className="flex-1 block w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button className="px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-800">
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}