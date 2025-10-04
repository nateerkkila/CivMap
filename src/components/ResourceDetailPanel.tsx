'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // <-- 1. Import the Next.js Image component
import { Item, Profile } from "@/types";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaChevronDown, 
  FaChevronUp, 
  FaBriefcase, 
  FaRegClock, 
  FaHome, 
  FaPhone,
  FaMapPin
} from "react-icons/fa";

// The "correct" shape our component will use internally
interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string } | null;
}
// The "raw" shape that Supabase sends due to the indirect FK relationship
interface RawComment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string }[]; // The key difference: it's an array
}
interface Vote {
  direction: -1 | 1;
}

const ProfileDetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | null | undefined }) => {
  if (!value) return null;
  return (
    <div>
      <dt className="flex items-center text-sm font-semibold text-gray-800">
        {icon}
        <span className="ml-2">{label}</span>
      </dt>
      <dd className="mt-1 ml-6 text-sm text-gray-600">{value}</dd>
    </div>
  );
};

interface ResourceDetailPanelProps {
  item: Item | null;
  onClose: () => void;
}

export default function ResourceDetailPanel({ item, onClose }: ResourceDetailPanelProps) {
  const { user } = useAuth();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setIsProfileExpanded(false);
    setComments([]);
    setNewComment('');
    setVotes({ up: 0, down: 0 });
    setUserVote(null);

    if (item) {
      setLoadingData(true);
      
      Promise.all([
        supabase.from('comments').select(`id, content, created_at, profiles ( username )`).eq('item_id', item.id).order('created_at', { ascending: false }),
        supabase.from('votes').select('direction').eq('item_id', item.id),
        user ? supabase.from('votes').select('direction').eq('item_id', item.id).eq('user_id', user.id).single() : Promise.resolve({ data: null, error: null })
      ]).then(([commentsRes, votesRes, userVoteRes]) => {
        
        if (commentsRes.error) {
          console.error("Error fetching comments:", commentsRes.error);
        } else {
          // --- FIX for the 'any' error ---
          // We now map from the known `RawComment` type to the `Comment` type.
          const formattedComments = (commentsRes.data as RawComment[]).map((comment) => ({
            ...comment,
            profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
          }));
          setComments(formattedComments);
        }

        if (votesRes.error) console.error("Error fetching votes:", votesRes.error);
        else if (votesRes.data) {
          setVotes({
            up: votesRes.data.filter(v => v.direction === 1).length,
            down: votesRes.data.filter(v => v.direction === -1).length,
          });
        }
        
        if (userVoteRes.error && userVoteRes.error.code !== 'PGRST116') {
             console.error("Error fetching user vote:", userVoteRes.error);
        } else {
             setUserVote(userVoteRes.data as Vote | null);
        }

        setLoadingData(false);
      });
    }
  }, [item, user]);

  const handleVote = async (direction: 1 | -1) => {
    if (!user || !item) return;
    const { error } = await supabase.rpc('handle_vote', { item_id_input: item.id, direction_input: direction });
    if (error) {
      console.error("Failed to save vote:", error);
    } else {
      const { data: votesData } = await supabase.from('votes').select('direction').eq('item_id', item.id);
      if (votesData) {
        setVotes({ up: votesData.filter(v => v.direction === 1).length, down: votesData.filter(v => v.direction === -1).length });
      }
      const { data: userVoteData } = await supabase.from('votes').select('direction').eq('item_id', item.id).eq('user_id', user.id).single();
      setUserVote(userVoteData as Vote | null);
    }
  };

  const handlePostComment = async () => {
    if (!user || !item || newComment.trim() === '') return;
    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: user.id, item_id: item.id, content: newComment.trim() })
      .select(`id, content, created_at, profiles ( username )`)
      .single();
    if (error) {
      console.error("Failed to post comment:", error);
    } else {
      const formattedNewComment = { ...data, profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles };
      setComments([formattedNewComment as Comment, ...comments]);
      setNewComment('');
    }
  };

  if (!item) return null;
  const formattedDate = format(new Date(item.created_at), 'P');
  const profile: Profile | null = item.profiles;

  return (
    <div className="absolute top-4 left-4 z-[1000] w-[400px] max-w-[90vw] bg-white rounded-lg shadow-xl flex flex-col max-h-[calc(100vh-2rem)]">
      <div className="flex-shrink-0 p-4 border-b">
        <button onClick={onClose} className="text-indigo-600 font-semibold hover:text-indigo-800">&larr; Back to Map</button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <p className="flex items-center text-sm text-gray-500"><FaMapPin className="mr-2 flex-shrink-0" /> {item.address || 'Precise location on map'}</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{item.general_description}</h1>
        </div>
        <div className="flex items-start justify-between text-sm text-gray-600 mb-4">
          <button onClick={() => setIsProfileExpanded(!isProfileExpanded)} className="flex items-center text-left rounded-md -ml-2 p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <div className="w-10 h-10 rounded-full bg-indigo-200 mr-3 flex-shrink-0"></div>
            <div>
              <p className="font-semibold text-gray-800">{profile?.username || 'Anonymous'}</p>
              <p>{formattedDate}</p>
            </div>
            <div className="ml-3 text-gray-400">{isProfileExpanded ? <FaChevronUp /> : <FaChevronDown />}</div>
          </button>
          <div className="flex items-center gap-4 text-gray-500 pt-2">
            <button onClick={() => handleVote(1)} disabled={!user} className={`flex items-center gap-1 cursor-pointer ${userVote?.direction === 1 ? 'text-green-600 font-bold' : 'hover:text-green-600'} disabled:cursor-not-allowed disabled:text-gray-400`}><FaThumbsUp /><span>{votes.up}</span></button>
            <button onClick={() => handleVote(-1)} disabled={!user} className={`flex items-center gap-1 cursor-pointer ${userVote?.direction === -1 ? 'text-red-600 font-bold' : 'hover:text-red-600'} disabled:cursor-not-allowed disabled:text-gray-400`}><FaThumbsDown /><span>{votes.down}</span></button>
          </div>
        </div>
        {isProfileExpanded && profile && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3 animate-fade-in">
            <h3 className="text-md font-bold text-gray-800 mb-2">Civilian Details</h3>
            <ProfileDetailRow icon={<FaBriefcase />} label="Profession" value={profile.profession} />
            <ProfileDetailRow icon={<FaRegClock />} label="Availability Notes" value={profile.availability_notes} />
            <ProfileDetailRow icon={<FaHome />} label="Registered Address" value={profile.registered_address} />
            <div className="pt-2 border-t mt-3"><ProfileDetailRow icon={<FaPhone />} label="Phone" value={profile.phone} /></div>
          </div>
        )}
        {/* --- FIX for the Image warning --- */}
        {item.attributes?.image_url && (
          <div className="my-4 relative w-full h-56"> 
            <Image 
              src={item.attributes.image_url as string} 
              alt={item.general_description} 
              fill
              sizes="(max-width: 400px) 90vw, 400px"
              className="rounded-lg border object-cover"
            />
          </div>
        )}
        <div className="border-t pt-6 mt-6">
          <h3 className="font-bold text-gray-800 mb-4">Comments ({comments.length})</h3>
          {loadingData ? ( <p className="text-gray-500">Loading comments...</p> ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex-shrink-0"></div>
                  <div>
                    <p><span className="font-semibold text-gray-800">{comment.profiles?.username || 'Anonymous'}</span><span className="text-gray-500 ml-2">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span></p>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : ( <p className="text-center text-gray-500 italic">No comments yet...</p> )}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex items-center gap-3">
          <textarea placeholder={user ? "What do you think?" : "You must be logged in to comment."} rows={1} value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={!user} className="flex-1 block w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100" />
          <button onClick={handlePostComment} disabled={!user || newComment.trim() === ''} className="px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed">SEND</button>
        </div>
      </div>
    </div>
  );
}