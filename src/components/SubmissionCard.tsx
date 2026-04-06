import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experiments } from '@/data/experiments';
import { MapPin, Calendar, FlaskConical, ChevronLeft, ChevronRight, MessageCircle, Maximize2 } from 'lucide-react';
import ReactionBar from './ReactionBar';
import type { ReactionCounts } from '@/lib/communityService';
import type { SubmissionWithMedia } from '@/lib/submissionService';

interface SubmissionCardProps {
  submission: SubmissionWithMedia;
  showExperimentInfo?: boolean;
  showUserInfo?: boolean;
  compact?: boolean;
  commentCount?: number;
  reactionCounts?: ReactionCounts;
  userReactions?: string[];
  onSignInClick?: () => void;
  onOpenComments?: (submissionId: string) => void;
}

export default function SubmissionCard({
  submission,
  showExperimentInfo = true,
  showUserInfo = true,
  compact = false,
  commentCount = 0,
  reactionCounts,
  userReactions,
  onSignInClick,
  onOpenComments,
}: SubmissionCardProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();

  const experiment = experiments.find(e => e.id === submission.experiment_id);
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

  return (
    <>
      <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${compact ? '' : 'shadow-sm'}`}>
        {/* Photo carousel */}
        {hasMedia && (
          <div className="relative aspect-video bg-gray-100 group">
            <img
              src={media[currentPhoto].file_url}
              alt="Experiment result"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Expand button */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Photo counter */}
            {media.length > 1 && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-lg text-white text-xs font-medium">
                {currentPhoto + 1} / {media.length}
              </div>
            )}

            {/* Navigation arrows */}
            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPhoto(prev => (prev - 1 + media.length) % media.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPhoto(prev => (prev + 1) % media.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentPhoto(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentPhoto ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className={compact ? 'p-4' : 'p-5'}>
          {/* User info */}
          {showUserInfo && profile && (
            <button
              onClick={() => navigate(`/profile/${submission.user_id}`)}
              className="flex items-center gap-3 mb-3 group w-full text-left"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>{dateStr}</span>
                  {profile.location && (
                    <>
                      <span className="text-gray-300">·</span>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          )}

          {/* Experiment info */}
          {showExperimentInfo && experiment && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-blue-600 truncate">{experiment.title}</span>
            </div>
          )}

          {/* Results / Notes */}
          <p className={`text-gray-700 ${compact ? 'text-sm line-clamp-3' : 'text-sm leading-relaxed'}`}>
            {submission.notes || submission.results}
          </p>

          {/* Additional notes (if results and notes are different) */}
          {!compact && submission.results && submission.notes && submission.results !== submission.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Additional Notes</p>
              <p className="text-xs text-gray-600 leading-relaxed">{submission.notes}</p>
            </div>
          )}

          {/* Reactions & Comments bar */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <ReactionBar
                submissionId={submission.id}
                initialCounts={reactionCounts}
                initialUserReactions={userReactions}
                compact={compact}
                onSignInClick={onSignInClick}
              />

              {/* Comment count button */}
              <button
                onClick={() => onOpenComments?.(submission.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"
                title={commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Start the first discussion'}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {commentCount > 0 ? commentCount : ''}
                {commentCount === 0 && <span className="hidden sm:inline text-gray-400">Discuss</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && hasMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
          >
            <span className="text-xl font-light">&times;</span>
          </button>

          <img
            src={media[currentPhoto].file_url}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPhoto(prev => (prev - 1 + media.length) % media.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPhoto(prev => (prev + 1) % media.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentPhoto(i); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentPhoto ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
