'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheck, FaPlus, FaMap, FaList, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';

interface TopBarProps {
  activeView: 'resources' | 'map';
  onToggleView: () => void;
  onShowConfirmModal: () => void;
  onSecurityLevelRefresh?: () => void;
  showConfirmButton?: boolean;
  showAddResourceButton?: boolean;
}

export default function TopBar({ 
  activeView, 
  onToggleView, 
  onShowConfirmModal,
  onSecurityLevelRefresh,
  showConfirmButton = true,
  showAddResourceButton = true
}: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleTitleDoubleClick = () => {
    console.log('Security level refresh requested');
    if (onSecurityLevelRefresh) {
      onSecurityLevelRefresh();
    }
  };

  return (
    <header className="flex-shrink-0 bg-white shadow-sm z-10">
      <div className="flex items-center justify-between max-w-7xl px-4 py-3 mx-auto sm:px-6 lg:px-8">
        <h1 
          className="text-xl font-bold leading-6 text-gray-900 cursor-pointer select-none"
          onDoubleClick={handleTitleDoubleClick}
          title="Double-click to refresh security level"
        >
          CivMap Dashboard
        </h1>
        <div className="flex items-center gap-2">
          {showConfirmButton && (
            <button 
              onClick={onShowConfirmModal}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            >
              <FaCheck/> Confirm Resources
            </button>
          )}
          {showAddResourceButton && (
            <>
              <Link 
                href="/report-threat"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              >
                <FaExclamationTriangle /> Report Threat
              </Link>
              <Link 
                href="/register-resource" 
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
              >
                <FaPlus /> Add Resource
              </Link>
            </>
          )}
          <button onClick={onToggleView} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            {activeView === 'resources' ? <><FaMap />Map View</> : <><FaList />Resource View</>}
          </button>
          <button onClick={handleLogout} title="Logout" className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
}
