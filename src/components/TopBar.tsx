'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheck, FaPlus, FaMap, FaList, FaSignOutAlt, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';

type View = 'resources' | 'map' | 'threats';

interface TopBarProps {
  activeView: View;
  onSetView: (view: View) => void;
  onShowConfirmModal: () => void;
  onSecurityLevelRefresh?: () => void;
  showConfirmButton?: boolean;
  showAddResourceButton?: boolean;
  profile: Profile | null;
}

export default function TopBar({ 
  activeView, 
  onSetView,
  onShowConfirmModal,
  onSecurityLevelRefresh,
  showConfirmButton = true,
  showAddResourceButton = true,
  profile
}: TopBarProps) {
  const router = useRouter();
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };
  const handleTitleDoubleClick = () => { if (onSecurityLevelRefresh) onSecurityLevelRefresh(); };

  // Helper for the view toggle buttons
  const getButtonClass = (view: View) => {
    const base = "inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md shadow-sm";
    return activeView === view ? `${base} bg-indigo-600 text-white` : `${base} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`;
  };

  return (
    <header className="flex-shrink-0 bg-white shadow-sm z-10">
      <div className="flex items-center justify-between max-w-7xl px-4 py-3 mx-auto sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold leading-6 text-gray-900 cursor-pointer select-none" onDoubleClick={handleTitleDoubleClick} title="Double-click to refresh security level">
          CivMap Dashboard
        </h1>
        <div className="flex items-center gap-2">
          
          {showConfirmButton && (
            <button 
              onClick={onShowConfirmModal}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            >
              <FaCheck/> Confirm
            </button>
          )}
          {showAddResourceButton && (
            <>
              <Link 
                href="/report-threat"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              >
                <FaExclamationTriangle /> Report
              </Link>
              <Link 
                href="/register-resource" 
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
              >
                <FaPlus /> Register
              </Link>
            </>
          )}

          {/* View Toggles with Conditional Logic */}
          <div className="flex items-center p-1 bg-gray-100 rounded-lg ml-4">
            <button onClick={() => onSetView('resources')} className={getButtonClass('resources')}><FaList /> Resources</button>
            
            {profile && profile.security_level >= 10 && (
              <button onClick={() => onSetView('threats')} className={getButtonClass('threats')}>
                <FaShieldAlt /> Threats
              </button>
            )}
            
            <button onClick={() => onSetView('map')} className={getButtonClass('map')}><FaMap /> Map</button>
          </div>

          <button 
            onClick={handleLogout} 
            title="Logout" 
            className="ml-2 inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
}