import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissionsByExperiment, type SubmissionWithMedia, type CalculationData } from '@/lib/submissionService';
import { Users, Eye, Mountain, Ruler, Loader2, ChevronLeft, ChevronRight, Calendar, MapPin, RefreshCw } from 'lucide-react';

// The experiment ID for "Horizon Distance Observation"
const CALCULATOR_EXPERIMENT_ID = '1';

function tryParseCalcData(results: string): CalculationData | null {
  try {
    const parsed = JSON.parse(results);
    // Check if it has the expected fields
    if (typeof parsed.horizonMi === 'number' && typeof parsed.angleDeg === 'number') {
      return parsed as CalculationData;
    }
    return null;
  } catch {
    return null;
  }
}

function CommunityResultCard({ submission }: { submission: SubmissionWithMedia }) {
  const navigate = useNavigate();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const calcData = tryParseCalcData(submission.results);
  const profile = submission.user_profile;
  const media = submission.media || [];
  const hasMedia = media.length > 0;

  const displayName = profile?.display_name || 'Anonymous Researcher';
  const initials = displayName.slice(0, 2).toUpperCase();
  const dateStr = new Date(submission.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const verdictLabel = calcData
    ? calcData.fullyVisible
      ? 'Visible'
      : calcData.fullyHidden
      ? 'Hidden'
      : 'Partial'
    : null;

  const verdictColor = calcData
    ? calcData.fullyVisible
      ? 'bg-green-100 text-green-700 border-green-200'
      : calcData.fullyHidden
      ? 'bg-red-100 text-red-700 border-red-200'
      : 'bg-amber-100 text-amber-700 border-amber-200'
    : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 shadow-sm">
      {/* Photo carousel */}
      {hasMedia && (
        <div className="relative aspect-video bg-gray-100 group">
          <img
            src={media[currentPhoto].file_url}
            alt="Observation"
            className="w-full h-full object-cover"
          />
          {media.length > 1 && (
            <>
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-lg text-white text-xs font-medium">
                {currentPhoto + 1} / {media.length}
              </div>
              <button
                onClick={() => setCurrentPhoto(prev => (prev - 1 + media.length) % media.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPhoto(prev => (prev + 1) % media.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      <div className="p-4">
        {/* User info */}
        <button
          onClick={() => navigate(`/profile/${submission.user_id}`)}
          className="flex items-center gap-2.5 mb-3 group w-full text-left"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[10px] font-bold">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors truncate">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
              <span>{dateStr}</span>
              {profile?.location && (
                <>
                  <span className="text-gray-300">·</span>
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* Calculation data chips */}
        {calcData && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-medium text-blue-700">
              <Eye className="w-2.5 h-2.5" />
              {calcData.observerHeight} {calcData.observerUnit === 'feet' ? 'ft' : 'm'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-100 rounded-lg text-[10px] font-medium text-green-700">
              <Mountain className="w-2.5 h-2.5" />
              {calcData.targetHeight} {calcData.targetUnit === 'feet' ? 'ft' : 'm'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-100 rounded-lg text-[10px] font-medium text-purple-700">
              <Ruler className="w-2.5 h-2.5" />
              {calcData.distance} {calcData.distanceUnit === 'miles' ? 'mi' : 'km'}
            </span>
            {verdictLabel && (
              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-semibold border ${verdictColor}`}>
                {verdictLabel}
              </span>
            )}
          </div>
        )}

        {/* Calculated values row */}
        {calcData && (
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
              <div className="text-[9px] text-gray-400 font-medium uppercase">Horizon</div>
              <div className="text-xs font-bold text-gray-700">{calcData.horizonMi.toFixed(2)} mi</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
              <div className="text-[9px] text-gray-400 font-medium uppercase">Hidden</div>
              <div className="text-xs font-bold text-gray-700">
                {calcData.fullyVisible ? '0 ft' : `${calcData.hiddenFt.toFixed(1)} ft`}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
              <div className="text-[9px] text-gray-400 font-medium uppercase">Angle</div>
              <div className="text-xs font-bold text-gray-700">{calcData.angleDeg.toFixed(4)}&deg;</div>
            </div>
          </div>
        )}

        {/* Notes */}
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
          {submission.notes}
        </p>
      </div>
    </div>
  );
}

interface CommunityResultsProps {
  refreshTrigger?: number;
}

export default function CommunityResults({ refreshTrigger = 0 }: CommunityResultsProps) {
  const [submissions, setSubmissions] = useState<SubmissionWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSubmissionsByExperiment(CALCULATOR_EXPERIMENT_ID, 20);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to fetch community results:', err);
      setError('Failed to load community results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [refreshTrigger]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Community Results</h2>
            <p className="text-xs text-gray-500">
              Real-world observations submitted by researchers
              {submissions.length > 0 && (
                <span className="ml-1 text-cyan-600 font-medium">· {submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading state */}
      {loading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading community results...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 text-sm font-medium text-cyan-600 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No observations yet</h3>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Be the first to submit a real-world observation! Run a calculation above and click "Submit This Result."
          </p>
        </div>
      )}

      {/* Results grid */}
      {!loading && submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map(sub => (
            <CommunityResultCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
