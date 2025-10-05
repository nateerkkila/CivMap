'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ThreatInsert } from '@/types';
import { FaExclamationTriangle, FaUser, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

type Threat = ThreatInsert & { 
  id: string;
  created_at: string;
  owner_username?: string; 
};

const threatTypes = [
  'Drone', 'Aircraft', 'Hostile Vehicle', 'Struck/Shelled Location',
  'Building Collapse', 'Blockade', 'Minefield', 'Suspicious Activity', 'Other'
];

const ThreatCard = ({ threat }: { threat: Threat }) => (
    <div className="flex p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-red-500"><FaExclamationTriangle className="w-8 h-8 text-white" /></div>
      <div className="flex-1 ml-4 overflow-hidden">
        <h3 className="font-bold text-gray-800 truncate">{threat.threat_type}</h3>
        <p className="text-sm text-gray-600 mt-1">{threat.description || 'No description provided.'}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <p className="flex items-center"><FaUser className="w-3 h-3 mr-1" />{threat.owner_username || 'Unknown User'}</p>
          <p className="flex items-center"><FaClock className="w-3 h-3 mr-1" />{formatDistanceToNow(new Date(threat.created_at), { addSuffix: true })}</p>
        </div>
      </div>
    </div>
);

export default function AllThreatsList() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [allThreats, setAllThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchAllThreats = async () => {
      setLoading(true);
      try {
        const { data: threatsData, error: threatsError } = await supabase.from('threats').select('*').order('created_at', { ascending: false });
        if (threatsError) throw threatsError;
        const userIds = [...new Set(threatsData.map(t => t.user_id))];
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id, username').in('id', userIds);
        if (profilesError) throw profilesError;
        const userMap = new Map(profilesData.map(p => [p.id, p.username]));
        const transformedData = threatsData.map(threat => ({ ...threat, owner_username: userMap.get(threat.user_id) || 'Unknown User' }));
        setAllThreats(transformedData);
        setThreats(transformedData);
      } catch (error) { console.error('Error fetching threats:', error); }
      finally { setLoading(false); }
    };
    fetchAllThreats();
  }, []);

  useEffect(() => {
    setThreats(filter === '' ? allThreats : allThreats.filter(t => t.threat_type === filter));
  }, [filter, allThreats]);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading all threats...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Community Threats</h2>
        <span className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">{threats.length} reports</span>
      </div>
      <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Threat Type</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="">All Types</option>
            {threatTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
          </select>
        </div>
         <div className="flex items-end"><button onClick={() => setFilter('')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Clear</button></div>
      </div>
      {threats.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {allThreats.length === 0 ? <p>No threats have been reported yet.</p> : <p>No threats match the selected filter.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {threats.map((threat) => (<ThreatCard key={threat.id} threat={threat} />))}
        </div>
      )}
    </div>
  );
}