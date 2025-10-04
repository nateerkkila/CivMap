import { FaUsers, FaBox, FaSync } from 'react-icons/fa';

interface ScoreSystemProps {
  stats: {
    peopleAdded: number;
    resourcesAdded: number;
    updates: number;
    totalScore: number;
  };
}

export default function ScoreSystem({ stats }: ScoreSystemProps) {
  // Calculate level based on total score (every 50 points = 1 level)
  const level = Math.floor(stats.totalScore / 20) + 1;
  
  // Simple title system based on level
  const getTitle = (level: number) => {
    if (level >= 10) return "Community Legend";
    if (level >= 7) return "Resource Master";
    if (level >= 5) return "Network Builder";
    if (level >= 3) return "Active Contributor";
    if (level >= 2) return "Helper";
    return "Newcomer";
  };

  const title = getTitle(level);

  return (
    <div className="mb-8">
      <div className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-lg shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-200">Your Progress</h2>
            <p className="text-blue-100">Level {level} • {title}</p>
          </div>
          <div className="flex justify-between items-center">
          <div className="flex flex-col items-center mr-5">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-200 mr-2">{stats.peopleAdded}</div>
              <FaUsers className="w-8 h-8 text-blue-200" />
            </div>
            <div className="text-sm text-blue-100 mt-1">People Added</div>
          </div>
          <div className="flex flex-col items-center mr-5">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-200 mr-2">{stats.resourcesAdded}</div>
              <FaBox className="w-8 h-8 text-blue-200" />
            </div>
            <div className="text-sm text-blue-100 mt-1">Resources Added</div>
          </div>
          <div className="flex flex-col items-center mr-5">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-200 mr-2">{stats.updates}</div>
              <FaSync className="w-8 h-8 text-blue-200" />
            </div>
            <div className="text-sm text-blue-100 mt-1">Updates</div>
          </div>
        </div>
        </div>
        
        
        
         {/* Progress bar to next level */}
         <div className="mt-4">
           <div className="flex justify-between text-sm text-blue-100 mb-1">
             <span>Level {level}</span>
             <span>{stats.totalScore % 20}/20 to Level {level + 1}</span>
           </div>
           <div className="w-full bg-blue-200 rounded-full h-1.5">
             <div 
               className="bg-white h-1.5 rounded-full transition-all duration-300"
               style={{ width: `${(stats.totalScore % 20) * 2}%` }}
             ></div>
           </div>
         </div>
      </div>
    </div>
  );
}
