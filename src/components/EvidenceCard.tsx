import { EvidenceItem, categoryMeta } from '../data/evidence';
import { Eye, Droplets, Sun, Atom, Compass, Camera, ChevronRight } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  eye: Eye,
  droplets: Droplets,
  sun: Sun,
  atom: Atom,
  compass: Compass,
  camera: Camera,
};

interface EvidenceCardProps {
  item: EvidenceItem;
  onClick: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function EvidenceCard({ item, onClick, isBookmarked, onToggleBookmark }: EvidenceCardProps) {
  const meta = categoryMeta[item.category];
  const IconComponent = iconMap[meta.icon] || Eye;

  const difficultyColor = {
    Easy: 'bg-green-100 text-green-700',
    Moderate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  }[item.verificationDifficulty];

  return (
    <div
      className={`group relative rounded-xl border-2 ${meta.borderColor} ${meta.bgColor} p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1`}
      onClick={onClick}
    >
      {/* Bookmark button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark();
        }}
        className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
          isBookmarked
            ? 'text-amber-500 bg-amber-100'
            : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
        }`}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this evidence'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </button>

      {/* Category icon & label */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg bg-white/80 shadow-sm ${meta.color}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
            {item.category}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 pr-8 group-hover:text-gray-700 transition-colors">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {item.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200/60">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor}`}>
          {item.verificationDifficulty} to verify
        </span>
        <div className="flex items-center gap-1 text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
          <span>Details</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {item.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-gray-500 font-medium">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
