import { EvidenceItem, categoryMeta } from '../data/evidence';
import { experiments } from '../data/experiments';
import { Eye, Droplets, Sun, Atom, Compass, Camera, X, ExternalLink, BookOpen, FlaskConical, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  eye: Eye,
  droplets: Droplets,
  sun: Sun,
  atom: Atom,
  compass: Compass,
  camera: Camera,
};

interface EvidenceDetailModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenExperiment: (experimentId: string) => void;
}

export default function EvidenceDetailModal({ item, onClose, isBookmarked, onToggleBookmark, onOpenExperiment }: EvidenceDetailModalProps) {
  if (!item) return null;

  const meta = categoryMeta[item.category];
  const IconComponent = iconMap[meta.icon] || Eye;
  const relatedExps = experiments.filter((e) => item.relatedExperimentIds.includes(e.id));

  const difficultyColor = {
    Easy: 'bg-green-100 text-green-700 border-green-300',
    Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Advanced: 'bg-red-100 text-red-700 border-red-300',
  }[item.verificationDifficulty];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl my-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative ${meta.bgColor} rounded-t-2xl p-8 border-b-2 ${meta.borderColor}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-white shadow-md ${meta.color}`}>
              <IconComponent className="w-7 h-7" />
            </div>
            <div className="flex-1 pr-10">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
                  {item.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${difficultyColor}`}>
                  {item.verificationDifficulty} to verify
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{item.title}</h2>
              <p className="text-gray-600 leading-relaxed">{item.summary}</p>
            </div>
          </div>

          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`absolute top-4 right-16 p-2 rounded-full transition-colors shadow-sm ${
              isBookmarked
                ? 'bg-amber-100 text-amber-600'
                : 'bg-white/80 hover:bg-amber-50 text-gray-400 hover:text-amber-500'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Full Description */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">Detailed Analysis</h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
          </section>

          {/* Key Observations */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Key Observations
            </h3>
            <ul className="space-y-2">
              {item.keyObservations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{obs}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Expected vs Observed Table */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Expected vs. Observed
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 font-bold text-gray-700 border-b border-gray-200 w-1/4">Scenario</th>
                    <th className="text-left p-4 font-bold text-gray-700 border-b border-gray-200 w-[37.5%]">
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-400" />
                        Globe Model Predicts
                      </span>
                    </th>
                    <th className="text-left p-4 font-bold text-gray-700 border-b border-gray-200 w-[37.5%]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Actually Observed
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {item.expectedVsObserved.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="p-4 font-medium text-gray-800 border-b border-gray-100">{row.label}</td>
                      <td className="p-4 text-red-700 bg-red-50/40 border-b border-gray-100">{row.expected}</td>
                      <td className="p-4 text-emerald-700 bg-emerald-50/40 border-b border-gray-100 font-medium">{row.observed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* How to Verify */}
          <section className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-600" />
              How to Verify This Yourself
            </h3>
            <p className="text-gray-700 leading-relaxed">{item.howToVerify}</p>
          </section>

          {/* Sources */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-gray-400" />
              Sources & References
            </h3>
            <ul className="space-y-2">
              {item.sources.map((source, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600">
                  <span className="text-gray-400 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm4.943-.69a.75.75 0 01.055-1.06l4.5-4a.75.75 0 011.06.055l.944 1.065a.75.75 0 01-.055 1.06l-4.5 4a.75.75 0 01-1.06-.055l-.944-1.065z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-sm">{source}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Related Experiments */}
          {relatedExps.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-500" />
                Related Experiments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedExps.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => {
                      onClose();
                      setTimeout(() => onOpenExperiment(exp.id), 300);
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
                  >
                    <img src={exp.image} alt={exp.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{exp.title}</p>
                      <p className="text-xs text-gray-500">{exp.category} · {exp.difficulty}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          <section className="pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
