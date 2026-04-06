import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Experiment } from '../data/experiments';
import { getSubmissionsByExperiment, SubmissionWithMedia } from '@/lib/submissionService';
import SubmissionForm from './SubmissionForm';
import {
  CheckCircle2, Circle, X, StickyNote, LogIn, Save, Loader2,
  Users, Plus, Calendar, MapPin, FlaskConical, ChevronLeft, ChevronRight, Camera, Eye, ExternalLink
} from 'lucide-react';

// Categories that should show the calculator link
const CALCULATOR_CATEGORIES = ['Horizon', 'Perspective', 'Water Level'];


interface ExperimentModalProps {
  experiment: Experiment | null;
  onClose: () => void;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  notes?: string;
  onUpdateNotes?: (notes: string) => Promise<void> | void;
  isLoggedIn?: boolean;
  onSignInClick?: () => void;
}

export default function ExperimentModal({
  experiment,
  onClose,
  isCompleted = false,
  onToggleComplete,
  notes = '',
  onUpdateNotes,
  isLoggedIn = false,
  onSignInClick,
}: ExperimentModalProps) {
  const navigate = useNavigate();
  const [localNotes, setLocalNotes] = useState(notes || '');
  const [notesSaved, setNotesSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionWithMedia[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionFormOpen, setSubmissionFormOpen] = useState(false);

  // Sync localNotes when the active experiment changes or notes prop updates
  useEffect(() => {
    setLocalNotes(notes || '');
    setNotesSaved(false);
  }, [experiment?.id, notes]);

  // Load community submissions
  useEffect(() => {
    if (experiment) {
      loadSubmissions();
    }
  }, [experiment?.id]);

  const loadSubmissions = async () => {
    if (!experiment) return;
    setLoadingSubmissions(true);
    const data = await getSubmissionsByExperiment(experiment.id);
    setSubmissions(data);
    setLoadingSubmissions(false);
  };

  if (!experiment) return null;

  const handleSaveNotes = async () => {
    if (!onUpdateNotes || saving) return;
    setSaving(true);
    try {
      await onUpdateNotes(localNotes);
      setNotesSaved(true);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNotes(e.target.value);
    if (notesSaved) setNotesSaved(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={onClose}>
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Hero image */}
          <div className="relative h-64">
            <img src={experiment.image} alt={experiment.title} className="w-full h-full object-cover" />

            {isCompleted && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-8">
            {/* Tags */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{experiment.category}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{experiment.difficulty}</span>
              <span className="text-sm text-gray-500">{experiment.duration}</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">{experiment.title}</h2>
            <p className="text-gray-600 mb-6">{experiment.description}</p>

            {/* Materials */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Materials Needed</h3>
              <ul className="list-disc list-inside space-y-2">
                {experiment.materials.map((material, idx) => (
                  <li key={idx} className="text-gray-700">{material}</li>
                ))}
              </ul>
            </div>

            {/* Procedure */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Procedure</h3>
              <ol className="space-y-3">
                {experiment.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Expected Results */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Expected Results</h3>
              <p className="text-gray-700">{experiment.expectedResults}</p>
            </div>

            {/* ═══ Observation Calculator Link (for relevant experiments) ═══ */}
            {CALCULATOR_CATEGORIES.includes(experiment.category) && (
              <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">Run the Visibility Test</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter your measurements and see what should be visible for this experiment.
                    </p>

                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/calculator');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Calculator
                  </button>
                </div>
              </div>
            )}


            {/* ═══ Community Results Section ═══ */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Community Results
                  {submissions.length > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      {submissions.length}
                    </span>
                  )}
                </h3>
                {isLoggedIn && (
                  <button
                    onClick={() => setSubmissionFormOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Submit Results
                  </button>
                )}
              </div>

              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : submissions.length === 0 ? (
                /* ─── Empty state ─── */
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 mb-1">No community results yet</p>
                  <p className="text-xs text-gray-400 mb-4">Be the first to share your findings for this experiment!</p>
                  {isLoggedIn ? (
                    <button
                      onClick={() => setSubmissionFormOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Submit Your Results
                    </button>
                  ) : (
                    <button
                      onClick={() => { onClose(); setTimeout(() => onSignInClick?.(), 300); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-xs font-semibold hover:bg-cyan-200 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign in to submit
                    </button>
                  )}
                </div>
              ) : (
                /* ─── Submission list ─── */
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((sub) => (
                    <CommunitySubmissionItem
                      key={sub.id}
                      submission={sub}
                      onClose={onClose}
                    />
                  ))}

                  {submissions.length > 5 && (
                    <p className="text-center text-xs text-gray-400 pt-2">
                      Showing 5 of {submissions.length} submissions
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ═══ Your Progress Section ═══ */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-purple-500" />
                  Your Progress
                </h3>

                {onToggleComplete && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        onClose();
                        setTimeout(() => onSignInClick?.(), 300);
                        return;
                      }
                      onToggleComplete();
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      !isLoggedIn
                        ? 'bg-gray-100 text-gray-500 border-2 border-gray-200 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-600'
                        : isCompleted
                          ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {!isLoggedIn ? (
                      <><LogIn className="w-5 h-5" /> Sign in to track</>
                    ) : isCompleted ? (
                      <><CheckCircle2 className="w-5 h-5" /> Completed</>
                    ) : (
                      <><Circle className="w-5 h-5" /> Mark Complete</>
                    )}
                  </button>
                )}
              </div>

              {/* Notes */}
              {isLoggedIn ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Personal Notes & Observations
                  </label>
                  <textarea
                    value={localNotes}
                    onChange={handleNotesChange}
                    placeholder="Record your observations, measurements, and findings here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none transition-all"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-400">
                      Notes are saved to your account and synced across devices
                    </div>
                    <button
                      onClick={handleSaveNotes}
                      disabled={saving || notesSaved}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        saving
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : notesSaved
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                      }`}
                    >
                      {saving ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                      ) : notesSaved ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</>
                      ) : (
                        <><Save className="w-3.5 h-3.5" /> Save Notes</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Sign-in prompt for notes */
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <LogIn className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Save your progress</p>
                    <p className="text-xs text-gray-600">Sign in to track completed experiments, take notes, and sync your progress across all your devices.</p>
                  </div>
                  <button
                    onClick={() => { onClose(); setTimeout(() => onSignInClick?.(), 300); }}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors flex-shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Submission Form Modal */}
      <SubmissionForm
        isOpen={submissionFormOpen}
        onClose={() => setSubmissionFormOpen(false)}
        preselectedExperimentId={experiment.id}
        onSubmitted={loadSubmissions}
      />
    </>
  );
}

// ─── Community Submission Item (inline sub-component) ────────────────────────

function CommunitySubmissionItem({
  submission,
  onClose,
}: {
  submission: SubmissionWithMedia;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const profile = submission.user_profile;
  const displayName = profile?.display_name || 'Anonymous';
  const initials = displayName.slice(0, 2).toUpperCase();
  const media = submission.media || [];
  const dateStr = new Date(submission.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      {/* User info */}
      <button
        onClick={() => { onClose(); navigate(`/profile/${submission.user_id}`); }}
        className="flex items-center gap-2.5 mb-3 group"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-bold">{initials}</span>
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">{displayName}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {dateStr}
            {profile?.location && (
              <>
                <span className="text-gray-300">·</span>
                <MapPin className="w-3 h-3" />
                {profile.location}
              </>
            )}
          </div>
        </div>
      </button>

      {/* Photos */}
      {media.length > 0 && (
        <div className="mb-3">
          {media.length === 1 ? (
            <img
              src={media[0].file_url}
              alt=""
              className="w-full h-40 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {media.map((m, i) => (
                  <img
                    key={m.id}
                    src={m.file_url}
                    alt=""
                    className="w-28 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Camera className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">{media.length} photos</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results text */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {submission.notes || submission.results}
      </p>
    </div>
  );
}
