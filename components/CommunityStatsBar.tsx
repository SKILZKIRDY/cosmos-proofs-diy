import { useState, useEffect } from 'react';
import { getCommunityStats, CommunityStats } from '@/lib/communityService';
import { Users, FileText, FlaskConical, MessageCircle } from 'lucide-react';

interface CommunityStatsBarProps {
  className?: string;
}

export default function CommunityStatsBar({ className = '' }: CommunityStatsBarProps) {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getCommunityStats();
    setStats(data);
    setLoading(false);
  };

  const statItems = [
    {
      label: 'Members',
      value: stats?.total_members || 0,
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      iconColor: 'text-cyan-500',
    },
    {
      label: 'Field Reports',
      value: stats?.total_submissions || 0,
      icon: FileText,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Experiments Tried',
      value: stats?.total_experiments_attempted || 0,
      icon: FlaskConical,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Discussions',
      value: (stats?.total_comments || 0) + (stats?.total_reactions || 0),
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="relative bg-white rounded-2xl border border-gray-200 p-5 overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Subtle gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
            
            <div className="flex items-start justify-between">
              <div>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
                ) : (
                  <div className={`text-3xl font-bold ${item.textColor}`}>
                    {item.value}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>

            {/* Empty state encouragement */}
            {!loading && item.value === 0 && (
              <p className="text-xs text-gray-400 mt-2 italic">Be the first!</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
