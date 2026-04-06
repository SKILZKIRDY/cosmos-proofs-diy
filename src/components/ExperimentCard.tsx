import { Experiment } from '../data/experiments';
import { CheckCircle2, Circle } from 'lucide-react';

interface ExperimentCardProps {
  experiment: Experiment;
  onClick: () => void;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

export default function ExperimentCard({ experiment, onClick, isCompleted = false, onToggleComplete }: ExperimentCardProps) {
  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-yellow-100 text-yellow-800',
    Advanced: 'bg-red-100 text-red-800'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative ${
        isCompleted ? 'ring-2 ring-green-400 ring-offset-2' : ''
      }`}
    >
      {/* Completed overlay badge */}
      {isCompleted && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-1.5 px-3 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </div>
      )}

      <div className={`relative h-48 overflow-hidden ${isCompleted ? 'mt-0' : ''}`}>
        <img 
          src={experiment.image} 
          alt={experiment.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[experiment.difficulty]}`}>
            {experiment.difficulty}
          </span>
        </div>

        {/* Completion toggle button */}
        {onToggleComplete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all shadow-md ${
              isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-white/90 text-gray-400 hover:text-green-500 hover:bg-white'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            {experiment.category}
          </span>
          <span className="text-xs text-gray-500">{experiment.duration}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{experiment.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{experiment.description}</p>
      </div>
    </div>
  );
}
