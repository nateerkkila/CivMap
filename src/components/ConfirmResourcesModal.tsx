'use client';

import { FaTimes } from 'react-icons/fa';

interface ConfirmResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  canConfirm?: boolean;
  lastConfirmedDate?: string;
}

export default function ConfirmResourcesModal({ isOpen, onClose, onConfirm, canConfirm = true, lastConfirmedDate }: ConfirmResourcesModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Confirm Resources</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
        
        {canConfirm ? (
          <>
            <p className="text-gray-600 mb-6">
              Are all your resources up to date?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Yes, Confirm
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-800 font-medium">Already confirmed today!</p>
              <p className="text-yellow-700 text-sm mt-1">
                You last confirmed your resources on {lastConfirmedDate ? formatDate(lastConfirmedDate) : 'today'}.
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                You can confirm again tomorrow.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
