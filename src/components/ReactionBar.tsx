import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toggleReaction, getReactions, getReactionsForUser, ReactionCounts } from '@/lib/communityService';
import { ThumbsUp, Lightbulb, CheckCircle, HelpCircle } from 'lucide-react';

interface ReactionBarProps {
  submissionId: string;
  initialCounts?: ReactionCounts;
  initialUserReactions?: string[];
  compact?: boolean;
  onSignInClick?: () => void;
}

const REACTION_CONFIG = [
  { type: 'support' as const, label: 'Support', Icon: ThumbsUp, activeColor: 'bg-blue-100 text-blue-700 border-blue-300', hoverColor: 'hover:bg-blue-50' },
  { type: 'insightful' as const, label: 'Insightful', Icon: Lightbulb, activeColor: 'bg-amber-100 text-amber-700 border-amber-300', hoverColor: 'hover:bg-amber-50' },
  { type: 'verified' as const, label: 'Verified', Icon: CheckCircle, activeColor: 'bg-green-100 text-green-700 border-green-300', hoverColor: 'hover:bg-green-50' },
  { type: 'question' as const, label: 'Question', Icon: HelpCircle, activeColor: 'bg-purple-100 text-purple-700 border-purple-300', hoverColor: 'hover:bg-purple-50' },
];

export default function ReactionBar({ submissionId, initialCounts, initialUserReactions, compact = false, onSignInClick }: ReactionBarProps) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>(
    initialCounts || { support: 0, insightful: 0, verified: 0, question: 0 }
  );
  const [userReactions, setUserReactions] = useState<Set<string>>(
    new Set(initialUserReactions || [])
  );
  const [loading, setLoading] = useState(!initialCounts);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCounts) {
      loadReactions();
    }
  }, [submissionId]);

  const loadReactions = async () => {
    const { counts: c } = await getReactions(submissionId);
    setCounts(c);

    if (user) {
      const ur = await getReactionsForUser(submissionId, user.id);
      setUserReactions(new Set(ur));
    }
    setLoading(false);
  };

  const handleToggle = async (reactionType: 'support' | 'insightful' | 'verified' | 'question') => {
    if (!user) {
      onSignInClick?.();
      return;
    }
    if (toggling) return;

    setToggling(reactionType);
    const isActive = userReactions.has(reactionType);

    // Optimistic update
    setCounts(prev => ({
      ...prev,
      [reactionType]: prev[reactionType] + (isActive ? -1 : 1),
    }));
    setUserReactions(prev => {
      const next = new Set(prev);
      if (isActive) next.delete(reactionType);
      else next.add(reactionType);
      return next;
    });

    const { error } = await toggleReaction(submissionId, user.id, reactionType);
    if (error) {
      // Revert on error
      setCounts(prev => ({
        ...prev,
        [reactionType]: prev[reactionType] + (isActive ? 1 : -1),
      }));
      setUserReactions(prev => {
        const next = new Set(prev);
        if (isActive) next.add(reactionType);
        else next.delete(reactionType);
        return next;
      });
    }
    setToggling(null);
  };

  const totalReactions = counts.support + counts.insightful + counts.verified + counts.question;

  if (loading) {
    return <div className="h-8 bg-gray-50 rounded-lg animate-pulse" />;
  }

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${compact ? '' : ''}`}>
      {REACTION_CONFIG.map(({ type, label, Icon, activeColor, hoverColor }) => {
        const isActive = userReactions.has(type);
        const count = counts[type];
        
        // In compact mode, hide reactions with 0 count unless user has reacted
        if (compact && count === 0 && !isActive) return null;

        return (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            disabled={toggling === type}
            title={user ? `${isActive ? 'Remove' : 'Add'} ${label}` : 'Sign in to react'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              isActive
                ? activeColor
                : `bg-gray-50 text-gray-500 border-gray-200 ${hoverColor}`
            } ${toggling === type ? 'opacity-50' : ''}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {count > 0 && <span>{count}</span>}
            {!compact && count === 0 && <span className="hidden sm:inline">{label}</span>}
          </button>
        );
      })}

      {compact && totalReactions === 0 && (
        <span className="text-xs text-gray-400 italic">No reactions yet</span>
      )}
    </div>
  );
}
